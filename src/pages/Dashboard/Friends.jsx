// src/pages/Friends.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  getFriends,
  friendRequest,        // alias -> sendFriendRequest
  friendRespond,        // alias -> respondFriendRequest
  removeFriend,
  getFriendsLeaderboard,
} from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";

// UI (shadcn)
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Icons
import {
  MailPlus,
  UserMinus,
  Check,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";

/* ---------- Styled Avatar ---------- */
function Avatar({ name }) {
  const initials = useMemo(() => {
    const parts = String(name || "").trim().split(/\s+/);
    const a = (parts[0] || "").charAt(0);
    const b = (parts[1] || "").charAt(0);
    return (a + b).toUpperCase();
  }, [name]);

  return (
    <div className="grid h-9 w-9 place-items-center rounded-full bg-orange-500/15 text-orange-300 text-sm font-semibold">
      <span>{initials || "?"}</span>
    </div>
  );
}

export default function Friends({ token }) {
  // Fallback to context token if prop not provided (keeps your new token-first calls working)
  const auth = useAuth?.();
  const authToken =
    token ??
    auth?.token ??
    auth?.auth_token ??
    auth?.auth?.token ??
    auth?.auth?.auth_token ??
    auth?.user?.token ??
    undefined;

  const [email, setEmail] = useState("");
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [friends, setFriends] = useState([]);
  const [board, setBoard] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState("");

  // -------- Helpers --------
  const emailLooksValid = (s) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

  const refresh = async () => {
    setRefreshing(true);
    setMsg("");
    try {
      const f = await getFriends(authToken);
      setIncoming(f?.incoming || []);
      setOutgoing(f?.outgoing || []);
      setFriends(f?.friends || []);

      const b = await getFriendsLeaderboard(authToken);
      setBoard(Array.isArray(b) ? b : []);
    } catch (e) {
      setMsg(e?.message || "Failed to load friends");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const f = await getFriends(authToken);
        if (!cancelled) {
          setIncoming(f?.incoming || []);
          setOutgoing(f?.outgoing || []);
          setFriends(f?.friends || []);
        }
        const b = await getFriendsLeaderboard(authToken);
        if (!cancelled) setBoard(Array.isArray(b) ? b : []);
      } catch (e) {
        if (!cancelled) setMsg(e?.message || "Failed to load friends");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authToken]);

  const sendInvite = async () => {
    const val = email.trim();
    if (!val) return;
    if (!emailLooksValid(val)) {
      setMsg("Please enter a valid email.");
      return;
    }
    setMsg("");
    try {
      await friendRequest(authToken, val);
      setMsg("Request sent!");
      setEmail("");
      refresh();
    } catch (e) {
      setMsg(e?.message || "Could not send request");
    }
  };

  const onRespond = async (fromUserId, action) => {
    try {
      await friendRespond(authToken, fromUserId, action); // 'accept' | 'reject'
      refresh();
    } catch (e) {
      setMsg(e?.message || "Failed to respond");
    }
  };

  const onRemove = async (friendId) => {
    try {
      await removeFriend(authToken, friendId);
      refresh();
    } catch (e) {
      setMsg(e?.message || "Failed to remove friend");
    }
  };

  const sortedBoard = useMemo(() => {
    const arr = [...(board || [])];
    arr.sort(
      (a, b) =>
        (b.avg_score ?? b.best_score ?? 0) - (a.avg_score ?? a.best_score ?? 0)
    );
    return arr;
  }, [board]);

  return (
    <main className="bg-slate-950 text-slate-100 min-h-[70vh]">
      {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-[90px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <Badge className="bg-orange-600/20 text-orange-300">Community</Badge>
            <h1 className="mt-2 text-3xl font-extrabold">Friends</h1>
            <p className="mt-1 text-sm text-slate-300">
              Add friends and compete on the leaderboard.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-200 hover:bg-slate-800 cursor-pointer hover:border-orange-300"
              onClick={refresh}
              disabled={refreshing || loading}
              title="Refresh"
            >
              {refreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Add a friend */}
            <Card className="border border-slate-800/60 bg-slate-900/40">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-lg font-semibold">Add a friend</div>
                </div>

                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-orange-500 sm:max-w-[360px]"
                    placeholder="friend@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black cursor-pointer"
                    onClick={sendInvite}
                  >
                    <MailPlus className="mr-2 h-4 w-4" /> Send request
                  </Button>
                </div>

                {msg && (
                  <div className="mt-3 text-xs text-slate-300 opacity-90">
                    {msg}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending — incoming */}
            <Card className="border border-slate-800/60 bg-slate-900/40">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-lg font-semibold">Pending — incoming</div>
                </div>

                {loading ? (
                  <div className="text-sm text-slate-400">Loading…</div>
                ) : incoming.length === 0 ? (
                  <div className="text-sm text-slate-400">No incoming.</div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {incoming.map((p) => (
                      <div
                        className="flex items-center justify-between py-3"
                        key={p.id}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={p.from_name} />
                          <div>
                            <div className="font-medium">{p.from_name}</div>
                            <div className="text-xs text-slate-400">
                              {p.from_email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            className="border-slate-700 text-slate-200 hover:border-orange-800 hover:text-orange-300 cursor-pointer"
                            onClick={() => onRespond(p.from_id, "reject")}
                          >
                            <X className="mr-2 h-4 w-4" /> Reject
                          </Button>
                          <Button
                            className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black cursor-pointer"
                            onClick={() => onRespond(p.from_id, "accept")}
                          >
                            <Check className="mr-2 h-4 w-4" /> Accept
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending — outgoing */}
            <Card className="border border-slate-800/60 bg-slate-900/40">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-lg font-semibold">Pending — outgoing</div>
                </div>

                {loading ? (
                  <div className="text-sm text-slate-400">Loading…</div>
                ) : outgoing.length === 0 ? (
                  <div className="text-sm text-slate-400">No outgoing.</div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {outgoing.map((p) => (
                      <div
                        className="flex items-center justify-between py-3"
                        key={p.id}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={p.to_name} />
                          <div>
                            <div className="font-medium">{p.to_name}</div>
                            <div className="text-xs text-slate-400">
                              {p.to_email}
                            </div>
                          </div>
                        </div>
                        <span className="inline-flex items-center rounded-md border border-amber-600/30 bg-amber-600/15 px-2 py-1 text-xs text-amber-300">
                          Waiting…
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Your Friends */}
            <Card className="border border-slate-800/60 bg-slate-900/40">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-lg font-semibold">Your Friends</div>
                </div>

                {loading ? (
                  <div className="text-sm text-slate-400">Loading…</div>
                ) : friends.length === 0 ? (
                  <div className="text-sm text-slate-400">
                    You have no friends yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {friends.map((f) => (
                      <div
                        className="flex items-center justify-between py-3"
                        key={f.id}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={f.name} />
                          <div>
                            <div className="font-medium">{f.name}</div>
                            <div className="text-xs text-slate-400">
                              {f.email}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="border-slate-700 text-slate-200 hover:border-orange-800 hover:text-orange-300 cursor-pointer"
                          onClick={() => onRemove(f.id)}
                        >
                          <UserMinus className="mr-2 h-4 w-4" /> Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN — LEADERBOARD */}
          <div>
            <Card className="border border-slate-800/60 bg-slate-900/40">
              <CardContent className="p-5">
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-lg font-semibold">Leaderboard</div>
                  <div className="text-xs text-slate-400">
                    Avg of last 5 attempts
                  </div>
                </div>

                {sortedBoard.length > 0 ? (
                  <>
                    {/* Podium */}
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {sortedBoard.slice(0, 3).map((r, i) => (
                        <div
                          key={i}
                          className="relative rounded-xl border border-slate-800/60 bg-slate-900/50 p-3 text-center"
                        >
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500/20">
                              <span className="text-lg">
                                {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                              </span>
                            </span>
                          </div>
                          <div className="mt-3 mb-2 flex justify-center">
                            <Avatar name={r.name} />
                          </div>
                          <div className="text-sm font-semibold">{r.name}</div>
                          <div className="mt-1 text-xs text-slate-300">
                            {Math.round(r.avg_score ?? r.best_score ?? 0)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Table */}
                    <div className="mt-5">
                      <div className="mb-2 grid grid-cols-[40px_1fr_140px_80px] items-center gap-2 text-xs text-slate-300">
                        <div>#</div>
                        <div>Name</div>
                        <div>Average</div>
                        <div>Best</div>
                      </div>

                      <div className="space-y-2">
                        {sortedBoard.map((r, i) => (
                          <div
                            key={r.id || `${r.email}-${i}`}
                            className="grid grid-cols-[40px_1fr_140px_70px] items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/50 p-2"
                          >
                            <div className="text-sm text-slate-300">
                              {i + 1}
                            </div>

                            <div className="flex items-center gap-2">
                              <Avatar name={r.name} />
                              <span className="text-sm">{r.name}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                                <div
                                  className="absolute inset-y-0 left-0 rounded-full bg-emerald-400/80"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.round(r.avg_score ?? 0)
                                    )}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-300">
                                {Math.round(r.avg_score ?? 0)}
                              </span>
                            </div>

                            <span className="inline-flex items-center justify-center rounded-md border border-slate-700 px-2 py-1 text-xs">
                              {Math.round(r.best_score ?? 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-400">
                    No scores yet. Ask a friend to attempt some mocks!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
