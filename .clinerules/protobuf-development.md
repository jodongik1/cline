# Cline Protobuf 개발 가이드 (Protobuf Development Guide)

이 가이드는 웹뷰(프론트엔드)와 익스텐션 호스트(백엔드) 간의 통신을 위한 새로운 gRPC 엔드포인트를 추가하는 방법을 설명합니다.

## 개요 (Overview)

Cline은 [Protobuf](https://protobuf.dev/)를 사용하여 강력한 타입의 API를 정의함으로써 효율적이고 타입 안정성 있는 통신을 보장합니다. 모든 정의는 `/proto` 디렉토리에 있습니다. 컴파일러와 플러그인은 프로젝트 의존성으로 포함되어 있으므로 수동으로 설치할 필요가 없습니다.

## 핵심 개념 및 권장 사항 (Key Concepts & Best Practices)

-   **파일 구조**: 각 기능 도메인은 자체 `.proto` 파일을 가져야 합니다 (예: `account.proto`, `task.proto`).
-   **메시지 설계**:
    -   단순한 단일 값 데이터의 경우, `proto/common.proto`에 있는 공유 타입(`StringRequest`, `Empty`, `Int64Request`)을 사용하여 일관성을 유지하십시오.
    -   복잡한 데이터 구조의 경우, 기능별 `.proto` 파일 내에 커스텀 메시지를 정의하십시오 (`task.proto`의 `NewTaskRequest` 예시 참고).
-   **명명 규칙**:
    -   서비스(Services): `PascalCaseService` (예: `AccountService`).
    -   RPCs: `camelCase` (예: `accountEmailIdentified`).
    -   메시지(Messages): `PascalCase` (예: `StringRequest`).
-   **스트리밍**: 서버에서 클라이언트로의 스트리밍의 경우, 응답 타입에 `stream` 키워드를 사용하십시오. `account.proto`의 `subscribeToAuthCallback` 예시를 참고하십시오.

---

## 4단계 개발 워크플로우 (4-Step Development Workflow)

`scrollToSettings`를 예로 들어 새로운 RPC를 추가하는 방법은 다음과 같습니다.

### 1. `.proto` 파일에 RPC 정의하기

`proto/` 디렉토리의 적절한 파일에 서비스 메서드를 추가합니다.

**파일: `proto/ui.proto`**
```proto
service UiService {
  // ... 기타 RPC들
  // 설정 뷰에서 특정 설정 섹션으로 스크롤합니다.
  rpc scrollToSettings(StringRequest) returns (KeyValuePair);
}
```
여기서는 공통 타입인 `StringRequest`와 `KeyValuePair`를 사용합니다.

### 2. 정의 컴파일하기

`.proto` 파일을 수정한 후 TypeScript 코드를 다시 생성해야 합니다. 프로젝트 루트에서 다음 명령을 실행하십시오:
```bash
npm run protos
```
이 명령은 모든 `.proto` 파일을 컴파일하고 생성된 코드를 `src/generated/` 및 `src/shared/`에 출력합니다. 생성된 파일을 수동으로 수정하지 마십시오.

### 3. 백엔드 핸들러 구현하기

백엔드에서 RPC 구현을 생성합니다. 핸들러는 `src/core/controller/[service-name]/`에 위치합니다.

**파일: `src/core/controller/ui/scrollToSettings.ts`**
```typescript
import { Controller } from ".."
import { StringRequest, KeyValuePair } from "../../../shared/proto/common"

/**
 * 설정으로 스크롤 액션을 실행합니다.
 * @param controller 컨트롤러 인스턴스
 * @param request 스크롤할 설정 섹션의 ID를 포함하는 요청
 * @returns UI에서 처리할 액션 및 값 필드를 포함하는 KeyValuePair
 */
export async function scrollToSettings(controller: Controller, request: StringRequest): Promise<KeyValuePair> {
	return KeyValuePair.create({
		key: "scrollToSettings",
		value: request.value || "",
	})
}
```

### 4. 웹뷰에서 RPC 호출하기

`webview-ui/`의 React 컴포넌트에서 새로운 RPC를 호출합니다. 생성된 클라이언트를 사용하면 간단합니다.

**파일: `webview-ui/src/components/browser/BrowserSettingsMenu.tsx`** (예시)
```tsx
import { UiServiceClient } from "../../../services/grpc"
import { StringRequest } from "../../../../shared/proto/common"

// ... React 컴포넌트 내부
const handleMenuClick = async () => {
    try {
        await UiServiceClient.scrollToSettings(StringRequest.create({ value: "browser" }))
    } catch (error) {
        console.error("브라우저 설정으로 스크롤 중 오류 발생:", error)
    }
}
```
