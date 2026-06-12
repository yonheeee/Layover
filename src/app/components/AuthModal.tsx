import { useState } from "react";
import {
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  Train,
  Phone,
} from "lucide-react";

type AuthView = "login" | "signup" | "findId" | "findPassword" | "findIdResult" | "resetPassword";

interface AuthModalProps {
  onClose: () => void;
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3C7.03 3 3 6.36 3 10.5c0 2.62 1.64 4.93 4.13 6.3L6.1 20.13c-.08.26.2.47.43.33L10.8 17.9c.39.05.79.08 1.2.08 4.97 0 9-3.36 9-7.5S16.97 3 12 3z"
        fill="#3C1E1E"
      />
    </svg>
  );
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [view, setView] = useState<AuthView>("login");

  // login
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  // signup
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCodeVerified, setEmailCodeVerified] = useState(false);
  const [emailDuplChecked, setEmailDuplChecked] = useState<null | boolean>(null);
  const [signupPw, setSignupPw] = useState("");
  const [signupPwConfirm, setSignupPwConfirm] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showSignupPwC, setShowSignupPwC] = useState(false);

  // find id
  const [findIdName, setFindIdName] = useState("");
  const [findIdEmail, setFindIdEmail] = useState("");
  const [findIdCode, setFindIdCode] = useState("");
  const [findIdCodeSent, setFindIdCodeSent] = useState(false);
  const [foundId, setFoundId] = useState("");

  // find password
  const [findPwId, setFindPwId] = useState("");
  const [findPwEmail, setFindPwEmail] = useState("");
  const [findPwCodeSent, setFindPwCodeSent] = useState(false);
  const [findPwCode, setFindPwCode] = useState("");
  const [findPwCodeVerified, setFindPwCodeVerified] = useState(false);

  // reset password
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showNewPwC, setShowNewPwC] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const pwMatch = signupPw && signupPwConfirm && signupPw === signupPwConfirm;
  const pwMismatch = signupPwConfirm && signupPw !== signupPwConfirm;
  const newPwMatch = newPw && newPwConfirm && newPw === newPwConfirm;
  const newPwMismatch = newPwConfirm && newPw !== newPwConfirm;

  const titles: Record<AuthView, string> = {
    login: "로그인",
    signup: "회원가입",
    findId: "아이디 찾기",
    findIdResult: "아이디 찾기",
    findPassword: "비밀번호 찾기",
    resetPassword: "새 비밀번호 설정",
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "14px",
    border: "1.5px solid rgba(178,228,220,0.5)",
    background: "#f0faf8",
    color: "#1a2e2b",
    fontSize: "0.92rem",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#6b8c87",
    letterSpacing: "0.03em",
    marginBottom: "6px",
    display: "block",
  };

  const btnPrimary: React.CSSProperties = {
    width: "100%",
    padding: "13px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #B2E4DC, #3db89e)",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.95rem",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(61,184,158,0.3)",
    transition: "opacity 0.2s",
    fontFamily: "inherit",
  };

  const btnOutline: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: "12px",
    border: "1.5px solid #3db89e",
    background: "#fff",
    color: "#3db89e",
    fontWeight: 600,
    fontSize: "0.82rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background 0.2s",
    fontFamily: "inherit",
    flexShrink: 0,
  };

  const btnSmallGray: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1.5px solid rgba(178,228,220,0.5)",
    background: "#f0faf8",
    color: "#6b8c87",
    fontWeight: 600,
    fontSize: "0.82rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
    fontFamily: "inherit",
  };

  const linkBtn: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#3db89e",
    fontWeight: 600,
    fontSize: "0.82rem",
    cursor: "pointer",
    padding: 0,
    fontFamily: "inherit",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  };

  const dividerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "4px 0",
  };

  function Field({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>{label}</label>
        {children}
      </div>
    );
  }

  function InputRow({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex gap-2 items-center w-full">{children}</div>
    );
  }

  function StatusMsg({
    ok,
    msg,
  }: {
    ok: boolean;
    msg: string;
  }) {
    return (
      <div
        className="flex items-center gap-1.5 mt-1"
        style={{ color: ok ? "#3db89e" : "#e05555", fontSize: "0.78rem" }}
      >
        {ok ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
        {msg}
      </div>
    );
  }

  /* ─────────────────────────── VIEWS ─────────────────────────── */

  function LoginView() {
    return (
      <div className="flex flex-col gap-5">
        <Field label="아이디 (이메일)">
          <div className="relative">
            <Mail
              size={15}
              color="#B2E4DC"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              style={{ ...inputBase, paddingLeft: "40px" }}
              placeholder="example@email.com"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
          </div>
        </Field>

        <Field label="비밀번호">
          <div className="relative">
            <Lock
              size={15}
              color="#B2E4DC"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              style={{ ...inputBase, paddingLeft: "40px", paddingRight: "44px" }}
              type={showLoginPw ? "text" : "password"}
              placeholder="비밀번호 입력"
              value={loginPw}
              onChange={(e) => setLoginPw(e.target.value)}
            />
            <button
              onClick={() => setShowLoginPw(!showLoginPw)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b8c87",
                display: "flex",
              }}
            >
              {showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <div className="flex justify-end gap-4">
          <button style={linkBtn} onClick={() => setView("findId")}>
            아이디 찾기
          </button>
          <button style={linkBtn} onClick={() => setView("findPassword")}>
            비밀번호 찾기
          </button>
        </div>

        <button style={btnPrimary}>로그인</button>

        <div style={dividerStyle}>
          <div style={{ flex: 1, height: "1px", background: "rgba(178,228,220,0.5)" }} />
          <span style={{ fontSize: "0.78rem", color: "#6b8c87", whiteSpace: "nowrap" }}>
            또는
          </span>
          <div style={{ flex: 1, height: "1px", background: "rgba(178,228,220,0.5)" }} />
        </div>

        {/* Kakao */}
        <button
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl transition-opacity hover:opacity-90"
          style={{
            background: "#FEE500",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.92rem",
            color: "#3C1E1E",
            borderRadius: "14px",
            fontFamily: "inherit",
          }}
        >
          <KakaoIcon />
          카카오로 시작하기
        </button>

        <p className="text-center" style={{ fontSize: "0.82rem", color: "#6b8c87" }}>
          아직 계정이 없으신가요?{" "}
          <button style={linkBtn} onClick={() => setView("signup")}>
            회원가입
          </button>
        </p>
      </div>
    );
  }

  function SignupView() {
    return (
      <div className="flex flex-col gap-4">
        <Field label="이름">
          <div className="relative">
            <User
              size={15}
              color="#B2E4DC"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              style={{ ...inputBase, paddingLeft: "40px" }}
              placeholder="홍길동"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
            />
          </div>
        </Field>

        {/* Email + 중복확인 */}
        <Field label="아이디 (이메일)">
          <InputRow>
            <div className="relative" style={{ flex: 1 }}>
              <Mail
                size={15}
                color="#B2E4DC"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                style={{ ...inputBase, paddingLeft: "40px" }}
                placeholder="example@email.com"
                value={signupEmail}
                onChange={(e) => {
                  setSignupEmail(e.target.value);
                  setEmailDuplChecked(null);
                  setEmailCodeSent(false);
                  setEmailCodeVerified(false);
                }}
              />
            </div>
            <button
              style={emailDuplChecked === true ? { ...btnOutline, background: "#E8F8F5" } : btnOutline}
              onClick={() => setEmailDuplChecked(true)}
            >
              {emailDuplChecked === true ? "✓ 확인완료" : "중복확인"}
            </button>
          </InputRow>
          {emailDuplChecked === true && (
            <StatusMsg ok msg="사용 가능한 이메일입니다." />
          )}
          {emailDuplChecked === false && (
            <StatusMsg ok={false} msg="이미 사용중인 이메일입니다." />
          )}
        </Field>

        {/* 인증번호 */}
        {emailDuplChecked === true && (
          <Field label="이메일 인증">
            <InputRow>
              <input
                style={{ ...inputBase, flex: 1 }}
                placeholder="인증번호 6자리"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                maxLength={6}
                disabled={emailCodeVerified}
              />
              {!emailCodeSent ? (
                <button style={btnOutline} onClick={() => setEmailCodeSent(true)}>
                  인증번호 발송
                </button>
              ) : !emailCodeVerified ? (
                <button
                  style={btnOutline}
                  onClick={() => setEmailCodeVerified(emailCode === "123456")}
                >
                  인증 확인
                </button>
              ) : (
                <button style={{ ...btnSmallGray, cursor: "default" }}>확인완료</button>
              )}
            </InputRow>
            {emailCodeSent && !emailCodeVerified && (
              <StatusMsg ok msg="인증번호가 발송되었습니다. (테스트: 123456)" />
            )}
            {emailCodeVerified && (
              <StatusMsg ok msg="이메일 인증이 완료되었습니다." />
            )}
          </Field>
        )}

        {/* 비밀번호 */}
        <Field label="비밀번호">
          <div className="relative">
            <Lock
              size={15}
              color="#B2E4DC"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              style={{ ...inputBase, paddingLeft: "40px", paddingRight: "44px" }}
              type={showSignupPw ? "text" : "password"}
              placeholder="영문+숫자 8자 이상"
              value={signupPw}
              onChange={(e) => setSignupPw(e.target.value)}
            />
            <button
              onClick={() => setShowSignupPw(!showSignupPw)}
              style={{
                position: "absolute", right: "14px", top: "50%",
                transform: "translateY(-50%)", background: "none",
                border: "none", cursor: "pointer", color: "#6b8c87", display: "flex",
              }}
            >
              {showSignupPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <Field label="비밀번호 확인">
          <div className="relative">
            <Lock
              size={15}
              color="#B2E4DC"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              style={{
                ...inputBase, paddingLeft: "40px", paddingRight: "44px",
                borderColor: pwMismatch
                  ? "rgba(224,85,85,0.5)"
                  : pwMatch
                  ? "rgba(61,184,158,0.6)"
                  : "rgba(178,228,220,0.5)",
              }}
              type={showSignupPwC ? "text" : "password"}
              placeholder="비밀번호 재입력"
              value={signupPwConfirm}
              onChange={(e) => setSignupPwConfirm(e.target.value)}
            />
            <button
              onClick={() => setShowSignupPwC(!showSignupPwC)}
              style={{
                position: "absolute", right: "14px", top: "50%",
                transform: "translateY(-50%)", background: "none",
                border: "none", cursor: "pointer", color: "#6b8c87", display: "flex",
              }}
            >
              {showSignupPwC ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {pwMatch && <StatusMsg ok msg="비밀번호가 일치합니다." />}
          {pwMismatch && <StatusMsg ok={false} msg="비밀번호가 일치하지 않습니다." />}
        </Field>

        <button style={{ ...btnPrimary, marginTop: "4px" }}>회원가입 완료</button>

        <p className="text-center" style={{ fontSize: "0.82rem", color: "#6b8c87" }}>
          이미 계정이 있으신가요?{" "}
          <button style={linkBtn} onClick={() => setView("login")}>
            로그인
          </button>
        </p>
      </div>
    );
  }

  function FindIdView() {
    return (
      <div className="flex flex-col gap-4">
        <p style={{ fontSize: "0.85rem", color: "#6b8c87", lineHeight: 1.6, marginBottom: "4px" }}>
          가입 시 등록한 이름과 이메일을 입력하면
          <br />아이디를 찾아드립니다.
        </p>

        <Field label="이름">
          <div className="relative">
            <User
              size={15}
              color="#B2E4DC"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              style={{ ...inputBase, paddingLeft: "40px" }}
              placeholder="홍길동"
              value={findIdName}
              onChange={(e) => setFindIdName(e.target.value)}
            />
          </div>
        </Field>

        <Field label="이메일">
          <InputRow>
            <div className="relative" style={{ flex: 1 }}>
              <Mail
                size={15}
                color="#B2E4DC"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                style={{ ...inputBase, paddingLeft: "40px" }}
                placeholder="example@email.com"
                value={findIdEmail}
                onChange={(e) => setFindIdEmail(e.target.value)}
              />
            </div>
            <button
              style={btnOutline}
              onClick={() => setFindIdCodeSent(true)}
            >
              인증번호 발송
            </button>
          </InputRow>
        </Field>

        {findIdCodeSent && (
          <Field label="인증번호">
            <InputRow>
              <input
                style={{ ...inputBase, flex: 1 }}
                placeholder="인증번호 6자리"
                value={findIdCode}
                onChange={(e) => setFindIdCode(e.target.value)}
                maxLength={6}
              />
              <button
                style={btnOutline}
                onClick={() => {
                  if (findIdCode === "123456") {
                    setFoundId("hong***@email.com");
                    setView("findIdResult");
                  }
                }}
              >
                확인
              </button>
            </InputRow>
            <StatusMsg ok msg="인증번호가 발송되었습니다. (테스트: 123456)" />
          </Field>
        )}

        <button
          style={{ ...btnPrimary, marginTop: "4px" }}
          onClick={() => {
            if (!findIdCodeSent) setFindIdCodeSent(true);
            else {
              setFoundId("hong***@email.com");
              setView("findIdResult");
            }
          }}
        >
          아이디 찾기
        </button>

        <div className="flex justify-center gap-4">
          <button style={linkBtn} onClick={() => setView("login")}>
            로그인
          </button>
          <span style={{ color: "rgba(178,228,220,0.8)", fontSize: "0.82rem" }}>|</span>
          <button style={linkBtn} onClick={() => setView("findPassword")}>
            비밀번호 찾기
          </button>
        </div>
      </div>
    );
  }

  function FindIdResultView() {
    return (
      <div className="flex flex-col gap-5 items-center text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "#E8F8F5" }}
        >
          <CheckCircle size={32} color="#3db89e" />
        </div>
        <div className="space-y-2">
          <p style={{ fontSize: "0.88rem", color: "#6b8c87" }}>
            입력하신 정보와 일치하는 아이디입니다.
          </p>
          <div
            className="px-6 py-4 rounded-2xl"
            style={{ background: "#E8F8F5", border: "1.5px solid rgba(178,228,220,0.6)" }}
          >
            <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a2e2b" }}>
              {foundId}
            </p>
          </div>
          <p style={{ fontSize: "0.78rem", color: "#6b8c87" }}>
            가입일: 2025년 03월 12일
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full pt-2">
          <button style={btnPrimary} onClick={() => setView("login")}>
            로그인하기
          </button>
          <button
            className="w-full py-3 rounded-2xl transition-opacity hover:opacity-80"
            style={{
              border: "1.5px solid rgba(178,228,220,0.5)",
              background: "#f0faf8",
              color: "#6b8c87",
              fontWeight: 600,
              fontSize: "0.92rem",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onClick={() => setView("findPassword")}
          >
            비밀번호 찾기
          </button>
        </div>
      </div>
    );
  }

  function FindPasswordView() {
    return (
      <div className="flex flex-col gap-4">
        <p style={{ fontSize: "0.85rem", color: "#6b8c87", lineHeight: 1.6, marginBottom: "4px" }}>
          아이디와 가입 이메일을 입력하면
          <br />이메일로 인증번호를 발송합니다.
        </p>

        <Field label="아이디 (이메일)">
          <div className="relative">
            <User
              size={15}
              color="#B2E4DC"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              style={{ ...inputBase, paddingLeft: "40px" }}
              placeholder="example@email.com"
              value={findPwId}
              onChange={(e) => setFindPwId(e.target.value)}
            />
          </div>
        </Field>

        <Field label="가입 이메일">
          <InputRow>
            <div className="relative" style={{ flex: 1 }}>
              <Mail
                size={15}
                color="#B2E4DC"
                style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                style={{ ...inputBase, paddingLeft: "40px" }}
                placeholder="example@email.com"
                value={findPwEmail}
                onChange={(e) => setFindPwEmail(e.target.value)}
              />
            </div>
            <button
              style={btnOutline}
              onClick={() => setFindPwCodeSent(true)}
            >
              인증번호 발송
            </button>
          </InputRow>
        </Field>

        {findPwCodeSent && (
          <Field label="이메일 인증번호">
            <InputRow>
              <div className="relative" style={{ flex: 1 }}>
                <Phone
                  size={15}
                  color="#B2E4DC"
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  style={{ ...inputBase, paddingLeft: "40px" }}
                  placeholder="인증번호 6자리"
                  value={findPwCode}
                  onChange={(e) => setFindPwCode(e.target.value)}
                  maxLength={6}
                  disabled={findPwCodeVerified}
                />
              </div>
              {!findPwCodeVerified ? (
                <button
                  style={btnOutline}
                  onClick={() => setFindPwCodeVerified(findPwCode === "123456")}
                >
                  인증 확인
                </button>
              ) : (
                <button style={{ ...btnSmallGray, cursor: "default" }}>확인완료</button>
              )}
            </InputRow>
            {!findPwCodeVerified && (
              <StatusMsg ok msg="인증번호가 발송되었습니다. (테스트: 123456)" />
            )}
            {findPwCodeVerified && (
              <StatusMsg ok msg="인증이 완료되었습니다." />
            )}
          </Field>
        )}

        <button
          style={{
            ...btnPrimary,
            marginTop: "4px",
            opacity: findPwCodeVerified ? 1 : 0.6,
            cursor: findPwCodeVerified ? "pointer" : "default",
          }}
          onClick={() => {
            if (!findPwCodeSent) {
              setFindPwCodeSent(true);
            } else if (findPwCodeVerified) {
              setView("resetPassword");
            }
          }}
        >
          {findPwCodeVerified ? "새 비밀번호 설정하기" : "인증번호 발송"}
        </button>

        <div className="flex justify-center gap-4">
          <button style={linkBtn} onClick={() => setView("login")}>
            로그인
          </button>
          <span style={{ color: "rgba(178,228,220,0.8)", fontSize: "0.82rem" }}>|</span>
          <button style={linkBtn} onClick={() => setView("findId")}>
            아이디 찾기
          </button>
        </div>
      </div>
    );
  }

  function ResetPasswordView() {
    return (
      <div className="flex flex-col gap-4">
        {resetDone ? (
          <div className="flex flex-col gap-5 items-center text-center pt-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "#E8F8F5" }}
            >
              <CheckCircle size={32} color="#3db89e" />
            </div>
            <div className="space-y-1">
              <p style={{ fontWeight: 700, fontSize: "1rem", color: "#1a2e2b" }}>
                비밀번호가 변경되었습니다!
              </p>
              <p style={{ fontSize: "0.85rem", color: "#6b8c87" }}>
                새 비밀번호로 로그인해 주세요.
              </p>
            </div>
            <button style={{ ...btnPrimary, marginTop: "8px" }} onClick={() => setView("login")}>
              로그인하기
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "0.85rem", color: "#6b8c87", lineHeight: 1.6, marginBottom: "4px" }}>
              새로운 비밀번호를 입력해 주세요.
            </p>
            <Field label="새 비밀번호">
              <div className="relative">
                <Lock
                  size={15}
                  color="#B2E4DC"
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  style={{ ...inputBase, paddingLeft: "40px", paddingRight: "44px" }}
                  type={showNewPw ? "text" : "password"}
                  placeholder="영문+숫자 8자 이상"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
                <button
                  onClick={() => setShowNewPw(!showNewPw)}
                  style={{
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", color: "#6b8c87", display: "flex",
                  }}
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Field label="새 비밀번호 확인">
              <div className="relative">
                <Lock
                  size={15}
                  color="#B2E4DC"
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  style={{
                    ...inputBase, paddingLeft: "40px", paddingRight: "44px",
                    borderColor: newPwMismatch
                      ? "rgba(224,85,85,0.5)"
                      : newPwMatch
                      ? "rgba(61,184,158,0.6)"
                      : "rgba(178,228,220,0.5)",
                  }}
                  type={showNewPwC ? "text" : "password"}
                  placeholder="새 비밀번호 재입력"
                  value={newPwConfirm}
                  onChange={(e) => setNewPwConfirm(e.target.value)}
                />
                <button
                  onClick={() => setShowNewPwC(!showNewPwC)}
                  style={{
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", color: "#6b8c87", display: "flex",
                  }}
                >
                  {showNewPwC ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {newPwMatch && <StatusMsg ok msg="비밀번호가 일치합니다." />}
              {newPwMismatch && <StatusMsg ok={false} msg="비밀번호가 일치하지 않습니다." />}
            </Field>

            <button
              style={{
                ...btnPrimary,
                marginTop: "4px",
                opacity: newPwMatch ? 1 : 0.6,
                cursor: newPwMatch ? "pointer" : "default",
              }}
              onClick={() => { if (newPwMatch) setResetDone(true); }}
            >
              비밀번호 변경 완료
            </button>
          </>
        )}
      </div>
    );
  }

  const viewMap: Record<AuthView, React.ReactNode> = {
    login: <LoginView />,
    signup: <SignupView />,
    findId: <FindIdView />,
    findIdResult: <FindIdResultView />,
    findPassword: <FindPasswordView />,
    resetPassword: <ResetPasswordView />,
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(26,46,43,0.45)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full rounded-3xl overflow-hidden"
        style={{
          maxWidth: "440px",
          background: "#ffffff",
          boxShadow: "0 24px 80px rgba(26,46,43,0.2), 0 4px 16px rgba(178,228,220,0.3)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-7 py-5"
          style={{
            background: "linear-gradient(135deg, #E8F8F5, #f0faf8)",
            borderBottom: "1px solid rgba(178,228,220,0.4)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #B2E4DC, #3db89e)" }}
            >
              <Train size={13} color="#fff" />
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "#1a2e2b",
                letterSpacing: "-0.01em",
              }}
            >
              {titles[view]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white"
            style={{ color: "#6b8c87", background: "rgba(255,255,255,0.6)", border: "none", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">{viewMap[view]}</div>
      </div>
    </div>
  );
}
