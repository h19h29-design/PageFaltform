const familyMessages = {
    "family-not-found": "가족 공간을 찾지 못했어요. 주소를 다시 확인해 주세요.",
    "invalid-secret": "입장 비밀번호 또는 접근 코드가 맞지 않아요.",
    "session-expired": "입장 시간이 만료되어 다시 확인이 필요해요.",
};
const consoleMessages = {
    "invalid-credentials": "이메일 또는 비밀번호가 맞지 않아요.",
    "not-authorized": "이 계정은 owner/admin 관리자 콘솔 권한이 없어요.",
    "session-required": "관리자 콘솔에 들어가려면 먼저 로그인해 주세요.",
};
export function getFamilyAccessErrorMessage(code) {
    if (!code) {
        return null;
    }
    return familyMessages[code] ?? "입장 확인 중 문제가 발생했어요.";
}
export function getConsoleAuthErrorMessage(code) {
    if (!code) {
        return null;
    }
    return consoleMessages[code] ?? "로그인 중 문제가 발생했어요.";
}
