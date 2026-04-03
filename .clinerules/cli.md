# CLI 개발 (CLI Development)

CLI는 `cli/` 디렉토리에 위치하며, 터미널 UI를 위해 React Ink를 사용합니다.

- 필요한 경우, `cli/src/constants/colors.ts`를 참고하여 `COLORS.primaryBlue` 하이라이트 색상(선택 사항, 스피너, 성공 상태 등)과 같은 공통 터미널 색상을 사용하십시오.
- gray 색상에 `dimColor`를 절대 사용하지 마십시오 (예: `<Text color="gray" dimColor>`). 읽기가 너무 어렵습니다. 보조 텍스트에는 `color="gray"`를 사용하고, 주요 텍스트에는 일반 전경색(No color)을 사용하십시오.
- 코어(core)의 상태나 메시지를 처리할 때, 웹뷰가 VS Code 익스텐션과 어떻게 통신하는지 참고하십시오.
- 웹뷰를 업데이트할 때는 터미널 사용자에게도 VS Code 익스텐션 사용자와 유사한 경험을 제공할 수 있도록 CLI TUI도 업데이트할 것을 사용자에게 제안하십시오.

## 새로운 API 프로바이더 추가 (Adding New API Providers)

익스텐션에 새로운 API 프로바이더를 추가할 때는 CLI도 반드시 업데이트해야 합니다:

1. **`cli/src/components/ModelPicker.tsx` 업데이트**: `getDefaultModelId()`가 올바른 기본 모델을 반환하도록 `providerModels` 맵에 프로바이더를 추가합니다. `@shared/api`에서 모델과 기본 ID를 가져옵니다:
   ```typescript
   import { newProviderDefaultModelId, newProviderModels } from "@/shared/api"

   export const providerModels = {
     // ...기존 프로바이더들
     "new-provider": { models: newProviderModels, defaultId: newProviderDefaultModelId },
   }
   ```

2. **인증 흐름에 `applyProviderConfig()` 사용**: 프로바이더를 위한 OAuth나 기타 인증 흐름을 구현할 때는 `cli/src/utils/provider-config.ts`의 공용 유틸리티를 사용하십시오:
   ```typescript
   import { applyProviderConfig } from "../utils/provider-config"

   // 인증 성공 후:
   await applyProviderConfig({ providerId: "new-provider", controller })
   ```
   이 유틸리티는 프로바이더 설정, 기본 모델 설정, API 키 매핑, 상태 지속성 유지 및 API 핸들러 재빌드를 처리합니다.

3. **프로바이더별 인증**: 프로바이더가 OAuth를 사용하는 경우(예: `openai-codex`), `SettingsPanelContent.tsx`의 `handleProviderSelect` 콜백에 호출 처리를 추가하십시오. 기존 Codex OAuth 흐름을 참고하십시오.