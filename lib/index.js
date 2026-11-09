/**
 * NieR: Automata skin — host (node) half.
 *
 * This package contributes browser presentation only, so the host body is an
 * intentional no-op: it exists so the Loader has a host-side row for the
 * bundle while every visual change ships through `exports["./client"]`
 * (`lib/client.js`). The empty apply is the standard form for pure-UI
 * plugins, not an omission.
 */

/** Host plugin body — this package contributes browser presentation only. */
export function apply() {}
