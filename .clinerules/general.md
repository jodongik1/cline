이 파일은 이 코드베이스에서 효율적으로 작업하기 위한 핵심 가이드입니다. 여기에는 빠른 수정과 수 시간의 시행착오 및 인간의 개입 사이의 차이를 만드는 미묘하고 명확하지 않은 패턴들, 즉 '부족의 지식(tribal knowledge)'이 담겨 있습니다.

**이 파일에 내용을 추가해야 할 때:**
- 사용자가 개입하여 교정하거나 가이드해야 했던 경우
- 무언가를 작동시키기 위해 여러 번의 시행착오가 필요했던 경우
- 이해하기 위해 많은 파일을 읽어야 했던 무언가를 발견한 경우
- 예상치 못한 파일들을 건드려야 했던 변경 사항
- 예상과 다르게 작동했던 것
- 사용자가 명시적으로 "이 내용을 CLAUDE.md에 추가해줘"라고 요청한 경우

위와 같은 상황이 발생하면 요청을 기다리지 말고 **먼저 추가를 제안**하십시오.

**추가하지 말아야 할 것:** 몇 개의 파일을 읽어서 파악할 수 있는 내용, 뻔한 패턴, 또는 표준적인 관습들. 이 파일은 포괄적인 문서가 아니라 핵심적인 정보(high-signal)만을 담아야 합니다.

## 기타 사항 (Miscellaneous)
- 이 프로젝트는 VS Code 익스텐션입니다. 빌드 확인 전 `package.json`에서 사용 가능한 스크립트를 확인하십시오 (예: `npm run build`가 아니라 `npm run compile`).
- PR을 생성할 때 기여자는 변경 이력(changelog) 엔트리 파일을 생성해서는 안 됩니다. 릴리스 버전 관리 및 변경 이력 정리는 릴리스 프로세스 중에 메인테이너가 담당합니다.
- 새로운 피처 플래그(feature flag)를 추가할 때는 다음 PR을 참고하십시오: https://github.com/cline/cline/pull/7566
- 요청 수행에 관한 추가 지침: @.clinerules/network.md

## gRPC/Protobuf 통신
익스텐션과 웹뷰는 VS Code 메시지 전달 방식을 통해 gRPC와 유사한 프로토콜로 통신합니다.

**Proto 파일은 `proto/`에 위치합니다** (예: `proto/cline/task.proto`, `proto/cline/ui.proto`)
- 각 기능 도메인은 자체 `.proto` 파일을 가집니다.
- 단순한 데이터에는 `proto/cline/common.proto`의 공유 타입(`StringRequest`, `Empty`, `Int64Request`)을 사용하십시오.
- 복잡한 데이터의 경우 기능별 `.proto` 파일에 커스텀 메시지를 정의하십시오.
- 명명 규칙: 서비스는 `PascalCaseService`, RPC는 `camelCase`, 메시지는 `PascalCase`
- 스트리밍 응답의 경우 `stream` 키워드를 사용하십시오 (`account.proto`의 `subscribeToAuthCallback` 참고).

**proto 변경 후에는 `npm run protos`를 실행하십시오.** 다음 위치에 타입이 생성됩니다:
- `src/shared/proto/` - 공유 타입 정의
- `src/generated/grpc-js/` - 서비스 구현체
- `src/generated/nice-grpc/` - Promise 기반 클라이언트
- `src/generated/hosts/` - 생성된 핸들러

**새로운 enum 값 추가**(예: 새로운 `ClineSay` 유형) 시 `src/shared/proto-conversions/cline-message.ts`의 변환 매핑을 업데이트해야 합니다.

**새로운 RPC 메서드 추가** 시 필요한 사항:
- `src/core/controller/<domain>/`의 핸들러
- 생성된 클라이언트를 통한 웹뷰의 호출: `UiServiceClient.scrollToSettings(StringRequest.create({ value: "browser" }))`

**예시 — `explain-changes` 기능 작업 범위:**
- `proto/cline/task.proto` - `ExplainChangesRequest` 메시지 및 `explainChanges` RPC 추가
- `proto/cline/ui.proto` - `ClineSay` enum에 `GENERATE_EXPLANATION = 29` 추가
- `src/shared/ExtensionMessage.ts` - `ClineSayGenerateExplanation` 타입 추가
- `src/shared/proto-conversions/cline-message.ts` - 새로운 say 타입 매핑 추가
- `src/core/controller/task/explainChanges.ts` - 핸들러 구현
- `webview-ui/src/components/chat/ChatRow.tsx` - UI 렌더링

## 새로운 API 프로바이더 추가
새로운 프로바이더(예: "openai-codex")를 추가할 때, 다음 세 곳의 proto 변환 레이어를 업데이트하지 않으면 프로바이더가 소리 없이 Anthropic으로 초기화됩니다:

1. `proto/cline/models.proto` - `ApiProvider` enum에 추가 (예: `OPENAI_CODEX = 40;`)
2. `src/shared/proto-conversions/models/api-configuration-conversion.ts`의 `convertApiProviderToProto()` - 문자열을 proto enum으로 매핑하는 케이스 추가
3. 동일한 파일의 `convertProtoToApiProvider()` - proto enum을 문자열로 다시 매핑하는 케이스 추가

**이것이 중요한 이유:** 이를 누락하면 프로바이더 문자열이 `default` 케이스에 걸려 `ANTHROPIC`을 반환하게 됩니다. 웹뷰, 프로바이더 목록, 핸들러 등은 모두 정상 작동하는 것처럼 보이지만, proto 직렬화를 거치는 과정에서 상태가 소리 없이 초기화됩니다. 에러도 발생하지 않습니다.

**프로바이더 추가 시 업데이트해야 할 다른 파일들:**
- `src/shared/api.ts` - `ApiProvider` 유니온 타입에 추가, 모델 정의
- `src/shared/providers/providers.json` - 드롭다운을 위한 프로바이더 목록에 추가
- `src/core/api/index.ts` - `createHandlerForProvider()`에 핸들러 등록
- `webview-ui/src/components/settings/utils/providerUtils.ts` - `getModelsForProvider()` 및 `normalizeApiConfiguration()`에 케이스 추가
- `webview-ui/src/utils/validate.ts` - 유효성 검사 케이스 추가
- `webview-ui/src/components/settings/ApiOptions.tsx` - 프로바이더 컴포넌트 렌더링

## Responses API 프로바이더 (OpenAI Codex, OpenAI Native)
OpenAI의 Responses API를 사용하는 프로바이더는 네이티브 도구 호출(native tool calling)이 필요합니다. XML 도구는 Responses API에서 작동하지 않습니다.

**네이티브 도구 호출이 깨졌을 때의 증상:**
- 도구가 여러 번 호출됨 (예: `ask_followup_question`이 같은 질문을 두 번 함)
- 도구 인자가 중복되거나 잘못 형성됨
- 모델은 응답하지만 도구가 인식되지 않음

**확인해야 할 근본 원인:**
1. **`src/utils/model-utils.ts`의 `isNextGenModelProvider()`에서 프로바이더 누락.** 네이티브 변형 매처(예: `native-gpt-5/config.ts`)가 이 함수를 호출합니다. 프로바이더가 목록에 없으면 매처가 false를 반환하고 XML 도구로 폴백(fallback)합니다.

2. **모델 정보(`src/shared/api.ts`)에서 `apiFormat: ApiFormat.OPENAI_RESPONSES` 누락.** 이 속성은 모델이 네이티브 도구 호출을 필요로 함을 나타냅니다. `src/core/task/index.ts`의 태스크 러너는 이를 확인하여 사용자 설정과 관계없이 `enableNativeToolCalls: true`를 강제합니다.

**새로운 Responses API 프로바이더 추가 시:**
1. `src/utils/model-utils.ts`의 `isNextGenModelProvider()` 목록에 프로바이더 추가
2. Responses API를 사용하는 모든 모델에 `apiFormat: ApiFormat.OPENAI_RESPONSES` 설정
3. 변형 매처와 태스크 러너가 나머지를 자동으로 처리합니다.

## 시스템 프롬프트에 도구 추가
이는 여러 프롬프트 변형과 설정이 얽혀 있어 까다롭습니다. **항상 기존의 유사한 도구를 먼저 찾아보고 그 패턴을 따르십시오.** 구현 전 프롬프트 정의 → 변형 설정 → 핸들러 → UI로 이어지는 전체 체인을 확인하십시오.

1. **`src/shared/tools.ts`의 `ClineDefaultTool` enum**에 추가
2. **`src/core/prompts/system-prompt/tools/`에 도구 정의** (`generate_explanation.ts`와 같은 파일 생성)
   - 각 `ModelFamily`(generic, next-gen, xs 등)에 대한 변형 정의
   - 변형 배열 익스포트 (예: `export const my_tool_variants = [GENERIC, NATIVE_NEXT_GEN, XS]`)
   - **폴백 동작**: 모델 패밀리에 대해 변형이 정의되지 않은 경우, `ClineToolSet.getToolByNameWithFallback()`은 자동으로 GENERIC으로 폴백합니다. 따라서 도구에 모델별 특화 동작이 필요한 경우가 아니라면 `[GENERIC]`만 익스포트하면 됩니다.
3. **`src/core/prompts/system-prompt/tools/init.ts`에 등록** - `allToolVariants`로 임포트하여 스프레드(spread)
4. **변형 설정에 추가** - 각 모델 패밀리는 `src/core/prompts/system-prompt/variants/*/config.ts`에 자체 설정을 가집니다. 도구의 enum을 `.tools()` 목록에 추가하십시오.
   - `generic/config.ts`, `next-gen/config.ts`, `gpt-5/config.ts`, `native-gpt-5/config.ts`, `native-gpt-5-1/config.ts`, `native-next-gen/config.ts`, `gemini-3/config.ts`, `glm/config.ts`, `hermes/config.ts`, `xs/config.ts`
   - **중요**: 변형 설정에 추가할 경우, 도구 명세가 해당 ModelFamily에 대한 변형을 익스포트하거나 GENERIC 폴백에 의존하는지 확인하십시오.
5. **`src/core/task/tools/handlers/`에 핸들러 생성**
6. 실행 흐름을 위해 필요한 경우 **`ToolExecutor.ts`에 연결**
7. 필요한 경우 **`src/core/assistant-message/index.ts`의 도구 파싱**에 추가
8. **도구에 UI 피드백이 있는 경우**: proto에 `ClineSay` enum 추가, `src/shared/ExtensionMessage.ts` 업데이트, `src/shared/proto-conversions/cline-message.ts` 업데이트, `webview-ui/src/components/chat/ChatRow.tsx` 업데이트

## 시스템 프롬프트 수정
**먼저 다음 파일들을 읽으십시오:** `src/core/prompts/system-prompt/README.md`, `tools/README.md`, `__tests__/README.md`

시스템 프롬프트는 모듈식입니다: **컴포넌트**(재사용 섹션) + **변형**(모델별 설정) + **템플릿**(`{{PLACEHOLDER}}` 치환).

**주요 디렉토리:**
- `components/` - 공유 섹션: `rules.ts`, `capabilities.ts`, `editing_files.ts` 등
- `variants/` - 모델별 특화: `generic/`, `next-gen/`, `xs/`, `gpt-5/`, `gemini-3/`, `hermes/`, `glm/` 등
- `templates/` - 템플릿 엔진 및 플레이스홀더 정의

**변형 계층 (어떤 것을 수정할지 사용자에게 확인):**
- **차세대(Next-gen)** (Claude 4, GPT-5, Gemini 2.5): `next-gen/`, `native-next-gen/`, `native-gpt-5/`, `native-gpt-5-1/`, `gemini-3/`, `gpt-5/`
- **표준(Standard)** (기본 폴백): `generic/`
- **로컬/소형 모델**: `xs/`, `hermes/`, `glm/`

**오버라이드 작동 방식:** 변형은 `config.ts`의 `componentOverrides`를 통해 컴포넌트를 오버라이드하거나, `template.ts`에서 커스텀 템플릿을 제공할 수 있습니다 (예: `next-gen/template.ts`는 `rules_template`을 익스포트함). 오버라이드가 없으면 `components/`의 공유 컴포넌트가 사용됩니다.

**예시: RULES 섹션에 규칙 추가**
1. 변형이 규칙을 오버라이드하는지 확인: `variants/*/template.ts`의 `rules_template` 또는 `config.ts`의 `componentOverrides.RULES` 확인
2. 공유된 경우: `components/rules.ts` 수정
3. 오버라이드된 경우: 해당 변형의 템플릿 수정
4. XS 변형은 특별함 — `template.ts`에 고도로 압축된 인라인 콘텐츠를 가짐

**변경 후에는 반드시 스냅샷을 다시 생성하십시오:**
```bash
UPDATE_SNAPSHOTS=true npm run test:unit
```
스냅샷은 `__tests__/__snapshots__/`에 위치합니다. 테스트는 모델 패밀리와 컨텍스트 변형(브라우저, MCP, 포커스 체인) 전반에 걸쳐 검증을 수행합니다.

## 기본 슬래시 명령어 수정
세 곳의 업데이트가 필요합니다:
- `src/core/slash-commands/index.ts` - 명령어 정의
- `src/core/prompts/commands.ts` - 시스템 프롬프트 통합
- `webview-ui/src/utils/slash-commands.ts` - 웹뷰 자동 완성

## 새로운 글로벌 상태(Global State) 키 추가
글로벌 상태에 새로운 키를 추가하려면 여러 곳의 업데이트가 필요합니다. 한 단계라도 누락하면 소리 없는 실패가 발생합니다.

필수 단계:
1. `src/shared/storage/state-keys.ts`에 타입 정의 - `GlobalState` 또는 `Settings` 인터페이스에 추가
2. `src/core/storage/utils/state-helpers.ts`에서 글로벌 상태 읽기:
   - `readGlobalStateFromDisk()`에 `const myKey = context.globalState.get<GlobalStateAndSettings["myKey"]>("myKey")` 추가
   - 리턴 객체에 추가: `myKey: myKey ?? defaultValue,`
3. 초기화 후 `StateManager`가 `setGlobalState()`/`getGlobalStateKey()`를 통해 읽기/쓰기를 처리합니다.

흔한 실수: `context.globalState.get()` 호출 없이 리턴 값만 추가하는 경우. 컴파일은 되지만 로드 시 값은 항상 `undefined`가 됩니다.

설정 연결 관련 주의사항: 키가 설정에서 사용자 토글이 가능한 경우, 두 가지 컨트롤러 업데이트 경로를 모두 연결하십시오:
- 웹뷰 `updateSetting(...)`을 위한 `src/core/controller/state/updateSettings.ts`
- CLI/ACP 설정 업데이트를 위한 `src/core/controller/state/updateSettingsCli.ts`
하나만 누락되어도 한쪽 화면에서는 토글이 바뀐 것처럼 보이지만 백엔드 상태는 바뀌지 않는 현상이 발생합니다.

웹뷰 토글 주의사항: 설정 변경 사항은 상태 페이로드(state payloads)에 포함되어 다시 돌아와야 합니다.
- 웹뷰 업데이트 요청을 위해 `proto/cline/state.proto`의 `UpdateSettingsRequest`에 필드 추가 후 `npm run protos` 실행
- `Controller.getStateToPostToWebview()` (`src/core/controller/index.ts`)에 키 포함
- `ExtensionState` 및 웹뷰 기본값에 키 포함 (`src/shared/ExtensionMessage.ts`, `webview-ui/src/context/ExtensionStateContext.tsx`)
이 왕복 연결이 누락되면 백엔드 값은 업데이트될 수 있지만 웹뷰의 토글은 멈춰 있거나 되돌아가는 것처럼 보입니다.

## StateManager 캐시 vs 직접적인 globalState 접근
StateManager는 `common.ts`의 `StateManager.initialize(context)` 중에 채워지는 인메모리 캐시를 사용합니다. 대부분의 상태 작업에는 `controller.stateManager.setGlobalState()`/`getGlobalStateKey()`를 사용하십시오.

예외: 익스텐션 시작 직후(캐시가 준비되기 전) 즉시 필요한 상태

Window A가 상태를 설정하고 즉시 Window B를 열 때, 새 창의 StateManager 캐시는 초기화 중에 `context.globalState`로부터 채워집니다. 시작 직후(예: `initialize()` 중의 `common.ts`) Window B에서 상태를 읽어야 하는 경우, StateManager 캐시 대신 `context.globalState.get()`에서 직접 읽으십시오.

예시 패턴 (`lastShownAnnouncementId` 및 `worktreeAutoOpenPath` 참고):
```typescript
// 쓰기 (일반적인 패턴)
controller.stateManager.setGlobalState("myKey", value)

// common.ts의 시작 시점에 읽기 (캐시 우회)
const value = context.globalState.get<string>("myKey")
```

이는 StateManager 캐시가 완전히 사용 가능해지기 전의 아주 짧은 시작 시점에 창 간 상태를 읽는 경우에만 필요합니다. 초기화 이후의 정상적인 상태 접근은 StateManager를 사용해야 합니다.

## ChatRow의 취소됨(Cancelled)/중단됨(Interrupted) 상태
ChatRow가 로딩/진행 중 상태(스피너)를 표시할 때, 태스크가 취소된 상황을 처리해야 합니다. 취소 시 메시지 내용이 업데이트되지 않기 때문에 컨텍스트를 통해 이를 유추해야 하므로 명확하지 않을 수 있습니다.

**패턴:**
1. 메시지에는 JSON 형태로 `message.text`에 저장된 `status` 필드(예: `"generating"`, `"complete"`, `"error"`)가 있습니다.
2. 작업 중간에 취소되면 상태는 영원히 `"generating"`으로 남습니다. 아무도 이를 업데이트하지 않기 때문입니다.
3. 취소를 감지하려면 다음 두 가지 조건을 확인하십시오:
   - `!isLast` — 이 메시지가 더 이상 마지막 메시지가 아니라면, 그 이후에 다른 일이 발생한 것(중단됨)입니다.
   - `lastModifiedMessage?.ask === "resume_task" || "resume_completed_task"` — 태스크가 방금 취소되어 재개를 기다리고 있는 상태입니다.

**`generate_explanation`의 예시:**
```tsx
const wasCancelled =
    explanationInfo.status === "generating" &&
    (!isLast ||
        lastModifiedMessage?.ask === "resume_task" ||
        lastModifiedMessage?.ask === "resume_completed_task")
const isGenerating = explanationInfo.status === "generating" && !wasCancelled
```

**두 가지를 모두 확인하는 이유:**
- `!isLast`가 감지하는 것: 취소됨 → 재개됨 → 다른 작업 수행 → 이 오래된 메시지는 만료됨
- `lastModifiedMessage?.ask === "resume_task"`가 감지하는 것: 방금 취소됨, 아직 재개되지 않음, 이 메시지는 기술적으로 여전히 "마지막(last)"임

**참고:** `BrowserSessionRow.tsx` 도 `isLastApiReqInterrupted`와 `isLastMessageResume`을 사용하여 유사한 패턴을 사용합니다.

**백엔드 측:** 스트리밍이 취소되면 스트리밍 함수가 반환된 후 `taskState.abort`를 확인하여 적절히 정리(탭 닫기, 코멘트 삭제 등)하십시오.
