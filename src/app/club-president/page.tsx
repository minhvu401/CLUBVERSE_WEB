"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  Crown,
  Shield,
  User,
  LogOut,
  Activity,
  X,
} from "lucide-react";

/* ================= utils ================= */
function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}
const glass =
  "border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

/* ================= types ================= */
type Status = "PENDING" | "APPROVED" | "REJECTED";
type Role = "OWNER" | "ADMIN" | "MEMBER";

type PendingAction = {
  id: string;
  name: string;
  reason: string;
  status: Status;
};

type Member = {
  id: string;
  name: string;
  role: Role;
};

type LogItem = {
  id: string;
  text: string;
};

/* ================= mock data ================= */
const INIT_ACTIONS: PendingAction[] = [
  {
    id: "a1",
    name: "Nguyễn Văn A",
    reason: "Muốn học hỏi và tham gia hoạt động CLB",
    status: "PENDING",
  },
  {
    id: "a2",
    name: "Trần Thị B",
    reason: "Yêu thích hoạt động cộng đồng",
    status: "PENDING",
  },
];

const INIT_MEMBERS: Member[] = [
  { id: "m1", name: "Chủ nhiệm CLB", role: "OWNER" },
  { id: "m2", name: "Admin Nguyễn C", role: "ADMIN" },
  { id: "m3", name: "Member Trần D", role: "MEMBER" },
];

const INIT_LOGS: LogItem[] = [
  { id: "l1", text: "CLB được tạo" },
  { id: "l2", text: "Admin Nguyễn C được bổ nhiệm" },
];

/* ================= UI bits ================= */
function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, string> = {
    OWNER: "bg-yellow-400/20 text-yellow-200",
    ADMIN: "bg-sky-400/20 text-sky-200",
    MEMBER: "bg-white/10 text-white/70",
  };
  const icon =
    role === "OWNER" ? <Crown size={12} /> : role === "ADMIN" ? <Shield size={12} /> : <User size={12} />;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.7rem]", map[role])}>
      {icon}
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    PENDING: "bg-amber-400/15 text-amber-200",
    APPROVED: "bg-emerald-400/15 text-emerald-200",
    REJECTED: "bg-rose-400/15 text-rose-200",
  };
  return (
    <span className={cn("rounded-full px-3 py-1 text-[0.7rem] font-semibold", map[status])}>
      {status}
    </span>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2">
        <div className={cn("rounded-3xl p-5", glass)}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{title}</div>
            <button onClick={onClose}>
              <X size={16} />
            </button>
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ================= page ================= */
export default function ClubPresidentPage() {
  const [tab, setTab] = useState<"dashboard" | "actions" | "members">("dashboard");

  const [actions, setActions] = useState(INIT_ACTIONS);
  const [members, setMembers] = useState(INIT_MEMBERS);
  const [logs, setLogs] = useState(INIT_LOGS);

  const [confirm, setConfirm] = useState<{
    open: boolean;
    id?: string;
    type?: "approve" | "reject";
  }>({ open: false });

  const approve = (id: string) => {
    setActions((p) => p.map((a) => (a.id === id ? { ...a, status: "APPROVED" } : a)));
    setMembers((p) => [...p, { id: "m" + Date.now(), name: "Member mới", role: "MEMBER" }]);
    setLogs((p) => [{ id: Date.now().toString(), text: "Duyệt đơn gia nhập" }, ...p]);
  };

  const reject = (id: string) => {
    setActions((p) => p.map((a) => (a.id === id ? { ...a, status: "REJECTED" } : a)));
    setLogs((p) => [{ id: Date.now().toString(), text: "Từ chối đơn gia nhập" }, ...p]);
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden text-white">
      {/* background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-950 via-purple-900 to-violet-950" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-violet-500/25 blur-3xl" />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* sidebar */}
        <aside className="w-64 shrink-0">
          <div className={cn("h-full rounded-3xl p-4", glass)}>
            <div className="mb-6 text-lg font-semibold">Club President</div>

            <nav className="space-y-1">
              <button onClick={() => setTab("dashboard")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/[0.08]">
                <LayoutDashboard size={16} /> Dashboard
              </button>
              <button onClick={() => setTab("actions")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/[0.08]">
                <Clock3 size={16} /> Pending Actions
              </button>
              <button onClick={() => setTab("members")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/[0.08]">
                <Users size={16} /> Members
              </button>
            </nav>

            <div className="mt-8 border-t border-white/10 pt-4">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-rose-300 hover:bg-rose-500/10">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </aside>

        {/* main */}
        <main className="flex-1 space-y-6">
          {tab === "dashboard" && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className={cn("rounded-2xl p-4", glass)}>Members: {members.length}</div>
                <div className={cn("rounded-2xl p-4", glass)}>Pending: {actions.filter(a => a.status === "PENDING").length}</div>
                <div className={cn("rounded-2xl p-4", glass)}>Approved: {actions.filter(a => a.status === "APPROVED").length}</div>
                <div className={cn("rounded-2xl p-4", glass)}>Rejected: {actions.filter(a => a.status === "REJECTED").length}</div>
              </div>

              <section className={cn("rounded-3xl p-5", glass)}>
                <div className="mb-3 flex items-center gap-2">
                  <Activity size={16} /> Activity Log
                </div>
                <ul className="space-y-2 text-sm text-white/70">
                  {logs.map((l) => (
                    <li key={l.id}>• {l.text}</li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {tab === "actions" && (
            <section className={cn("rounded-3xl p-5 space-y-4", glass)}>
              {actions.map((a) => (
                <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="font-semibold">{a.name}</div>
                      <p className="text-sm text-white/70">{a.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.status} />
                      <button onClick={() => alert("View detail")}><Eye size={16} /></button>
                      {a.status === "PENDING" && (
                        <>
                          <button onClick={() => setConfirm({ open: true, id: a.id, type: "approve" })}><CheckCircle2 size={16} /></button>
                          <button onClick={() => setConfirm({ open: true, id: a.id, type: "reject" })}><XCircle size={16} /></button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {tab === "members" && (
            <section className={cn("rounded-3xl p-5 space-y-3", glass)}>
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4">
                  <div className="font-semibold">{m.name}</div>
                  <RoleBadge role={m.role} />
                </div>
              ))}
            </section>
          )}
        </main>
      </div>

      {/* confirm modal */}
      <Modal
        open={confirm.open}
        title="Xác nhận"
        onClose={() => setConfirm({ open: false })}
      >
        <div className="space-y-3">
          <div className="text-sm text-white/70">
            Bạn có chắc muốn {confirm.type === "approve" ? "duyệt" : "từ chối"} yêu cầu này?
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirm({ open: false })} className="px-4 py-2 text-sm">Hủy</button>
            <button
              onClick={() => {
                if (confirm.type === "approve") approve(confirm.id!);
                if (confirm.type === "reject") reject(confirm.id!);
                setConfirm({ open: false });
              }}
              className="rounded-full bg-emerald-500/85 px-4 py-2 text-sm"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
