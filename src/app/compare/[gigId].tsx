/**
 * Candidate Comparison — wireframe 31/37. NEW additive route /compare/[gigId].
 * Real directory (not a (group)) so the literal URL matches the spec.
 * Specs: docs/wireframes/31-candidate-comparison.md
 *
 * What is REAL:
 *  - Same live feeds as screen 29: GET /api/gigs/:id + /applicants; cards are
 *    the shared CandidateCard (single source, per the GigCard rule).
 *  - Reject → the real PATCH /api/gigs/applications/:id/reject (only while the
 *    gig is OPEN; server enforces), behind a confirm Sheet, with query
 *    invalidation.
 *  - "N Shortlisted" counts real Application.status === SHORTLISTED rows.
 *
 * Flags (never faked):
 *  - Avg. Match: derived on-device from skills overlap (no matchScore column)
 *    — hinted "derived".
 *  - Avg. Exp: there is NO experience column anywhere — tile shows "—".
 *  - Shortlist button: same no-endpoint flag as screen 29.
 *  - Compare Finalists: with no way to shortlist, there are never finalists to
 *    compare — the green button raises the flag notice instead of a fake view.
 *  - Select (inside cards): deep-links Confirm Selection (screen 32).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  Button,
  ErrorState,
  InfoBanner,
  LoadingSkeleton,
  Screen,
  ScreenHeader,
  Sheet,
  StatBox,
  Text,
} from "@/components/ui";
import {
  Applicant,
  CandidateCard,
  matchPercent,
} from "@/components/business/candidate-card";
import { apiErrorMessage } from "@/config/api";
import { getApplicants, getGig, rejectApplicant } from "@/lib/gig-api";
import { useAuth } from "@/providers/auth-provider";
import { color } from "@/theme/colors";
import { shadow } from "@/theme/radius";
import { layout, space } from "@/theme/spacing";
import { useLayoutMetrics } from "@/hooks/use-layout-metrics";

/** Stable fallback: a fresh `[]` each render would invalidate memos keyed on it. */
const EMPTY_APPLICANTS: Applicant[] = [];

/* Shortlisting has no write path yet (the status exists, but only select/reject
   are exposed) — the action stays visible and says so instead of failing silently. */
const SHORTLIST_FLAG =
  "Shortlisting isn’t available yet — select the student you want, or reject the ones you don’t.";

export default function CompareCandidatesScreen() {
  const { contentBottom } = useLayoutMetrics("actionbar");

  const { gigId } = useLocalSearchParams<{ gigId: string }>();
  const { token } = useAuth();
  const client = useQueryClient();
  const [notice, setNotice] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Applicant | null>(null);
  const [error, setError] = useState<string | null>(null);

  const gigQuery = useQuery({
    queryKey: ["gig", gigId, token],
    queryFn: () => getGig(token!, gigId),
    enabled: !!token && !!gigId,
  });
  const applicantsQuery = useQuery({
    queryKey: ["applicants", gigId, token],
    queryFn: () => getApplicants(token!, gigId) as Promise<Applicant[]>,
    enabled: !!token && !!gigId,
  });

  const rejectMutation = useMutation({
    mutationFn: (applicationId: string) =>
      rejectApplicant(token!, applicationId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["applicants", gigId] });
      setRejectTarget(null);
    },
    onError: (err) => {
      setError(apiErrorMessage(err));
      setRejectTarget(null);
    },
  });

  const gig = gigQuery.data;
  const applicants = applicantsQuery.data ?? EMPTY_APPLICANTS;

  const ranked = useMemo(() => {
    const pending = applicants.filter(
      (applicant) =>
        applicant.status === "PENDING" || applicant.status === "SHORTLISTED",
    );
    const scored = pending.map((applicant) => ({
      applicant,
      match: matchPercent(applicant, gig?.skillsRequired ?? []),
    }));
    scored.sort((a, b) => (b.match ?? -1) - (a.match ?? -1));
    return scored;
  }, [applicants, gig]);

  const avgMatch = useMemo(() => {
    const values = ranked
      .map((row) => row.match)
      .filter((value): value is number => value !== null);
    if (values.length === 0) return null;
    return Math.round(
      values.reduce((sum, value) => sum + value, 0) / values.length,
    );
  }, [ranked]);

  const shortlistedCount = applicants.filter(
    (applicant) => applicant.status === "SHORTLISTED",
  ).length;

  return (
    <Screen testID="screen-compare-candidates">
      <ScreenHeader
        title="Applicants"
        subtitle={gig?.title}
        onBack={() => router.back()}
        variant="solid"
        actions={[
          {
            icon: "options",
            accessibilityLabel: "Filter options",
            onPress: () =>
              setNotice(
                "Filtering applicants isn’t available yet — use the tabs and sort to narrow the list.",
              ),
          },
        ]}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { flexGrow: 1, paddingBottom: contentBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statRow}>
          <StatBox
            variant="plain"
            icon="people"
            value={String(applicants.length)}
            label="Total"
            hint="applicants"
            style={styles.stat}
            testID="compare-stat-total"
          />
          <StatBox
            variant="plain"
            icon="starFilled"
            value={avgMatch !== null ? `${avgMatch}%` : "—"}
            label="Avg. Match"
            hint="skills overlap"
            style={styles.stat}
            testID="compare-stat-match"
          />
          <StatBox
            variant="plain"
            icon="stopwatch"
            value="—"
            label="Avg. Exp"
            hint="not tracked yet"
            style={styles.stat}
            testID="compare-stat-exp"
          />
        </View>

        {notice ? (
          <InfoBanner
            tone="warning"
            icon="info"
            title="Not available yet"
            description={notice}
          />
        ) : null}
        {error ? (
          <InfoBanner
            tone="danger"
            icon="offline"
            title="Could not reject"
            description={error}
          />
        ) : null}

        {gigQuery.isLoading || applicantsQuery.isLoading ? (
          <LoadingSkeleton count={3} />
        ) : null}
        {gigQuery.isError || applicantsQuery.isError ? (
          <ErrorState
            title="Could not load candidates"
            description={apiErrorMessage(
              gigQuery.error ?? applicantsQuery.error,
            )}
            onRetry={() => {
              gigQuery.refetch();
              applicantsQuery.refetch();
            }}
          />
        ) : null}

        {!gigQuery.isLoading &&
        !applicantsQuery.isLoading &&
        ranked.length === 0 ? (
          <InfoBanner
            tone="info"
            icon="info"
            title="No candidates to compare"
            description="Every applicant has been decided on, or nobody has applied yet."
          />
        ) : null}

        {ranked.map(({ applicant, match }) => (
          <View key={applicant.id} style={styles.pairBlock}>
            <CandidateCard
              applicant={applicant}
              match={match}
              gigId={gigId}
              onShortlist={() => setNotice(SHORTLIST_FLAG)}
              onOpenProfile={() =>
                router.push(
                  `/candidate/${applicant.student.id}?gigId=${gigId}` as never,
                )
              }
              onSelect={() =>
                router.push(`/assign/${applicant.id}?gigId=${gigId}` as never)
              }
            />
            {/* Compare-mode action row: solid Shortlist + outline Reject (real) */}
            <View style={styles.pairActions}>
              <Button
                label="Shortlist"
                size="sm"
                style={styles.pairBtn}
                onPress={() => setNotice(SHORTLIST_FLAG)}
                testID={`compare-shortlist-${applicant.id}`}
              />
              <Button
                label="Reject"
                variant="secondary"
                size="sm"
                style={styles.pairBtn}
                onPress={() => setRejectTarget(applicant)}
                testID={`compare-reject-${applicant.id}`}
              />
            </View>
          </View>
        ))}

        <InfoBanner
          tone="info"
          icon="info"
          title="About these numbers"
          description="Cards use the same layout as Manage Applicants. Average Match is our skills-overlap estimate; average experience isn’t tracked yet, so it stays blank."
        />
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky comparison bar.
          Kept visible for wireframe parity, but it is a secondary control that
          stays disabled while there are no finalists — a solid green primary
          button that cannot act is exactly the "dead button" this screen must
          avoid, and green is reserved for status, not for actions. */}
      <View style={styles.stickyBar}>
        <View style={styles.stickyText}>
          <Text variant="bodyStrong">{`${shortlistedCount} Shortlisted`}</Text>
          <Text variant="caption" tone="tertiary">
            {shortlistedCount === 0
              ? "Shortlist candidates to compare them side by side"
              : "Reviewing finalized candidates"}
          </Text>
        </View>
        <View style={styles.compareAction}>
          <Button
            label="Compare Finalists"
            variant="secondary"
            size="sm"
            icon="compare"
            fullWidth={false}
            disabled={shortlistedCount === 0}
            onPress={() =>
              setNotice(
                "Compare Finalists needs shortlisted candidates. Shortlisting isn’t available yet, so this stays empty for now.",
              )
            }
            testID="compare-finalists"
          />
        </View>
      </View>

      <Sheet
        visible={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject applicant?"
      >
        <Text variant="body" tone="secondary">
          {rejectTarget
            ? `This sends ${rejectTarget.student.name} a real rejection notification and closes their application for "${gig?.title ?? "this gig"}". Only open gigs allow rejections.`
            : ""}
        </Text>
        <Button
          label={rejectMutation.isPending ? "Rejecting…" : "Reject Applicant"}
          variant="danger"
          size="lg"
          loading={rejectMutation.isPending}
          onPress={() => rejectTarget && rejectMutation.mutate(rejectTarget.id)}
          testID="compare-reject-confirm"
        />
        <Button
          label="Keep Applicant"
          variant="secondary"
          size="lg"
          onPress={() => setRejectTarget(null)}
        />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.base,
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  statRow: { flexDirection: "row", gap: space.md },
  stat: { flex: 1 },

  pairBlock: { gap: space.sm },
  pairActions: { flexDirection: "row", gap: space.sm },
  pairBtn: { flex: 1 },

  bottomSpacer: { height: space.lg },
  stickyBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.base,
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.divider,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: space.md,
    ...shadow.sm,
  },
  stickyText: { flex: 1, gap: 2 },
  compareAction: { minWidth: 176 },
  pressed: { opacity: 0.85 },
});
