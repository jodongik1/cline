# Cline 훅(Hooks) 문서

## 개요 (Overview)

Cline 훅을 사용하면 에이전트 워크플로우의 특정 시점에 커스텀 스크립트를 실행할 수 있습니다. 훅은 다음 위치 중 하나에 배치할 수 있습니다:
- **글로벌 훅 디렉토리**: `~/Documents/Cline/Hooks/` (모든 워크스페이스에 적용)
- **워크스페이스 훅 디렉토리**: `.clinerules/hooks/` (해당 레포지토리가 속한 워크스페이스에만 적용)

훅은 활성화되어 있을 때 자동으로 실행됩니다.

## 훅 활성화 방법 (Enabling Hooks)

1. VSCode에서 Cline 설정을 엽니다.
2. 기능 설정(Feature Settings) 섹션으로 이동합니다.
3. "훅 활성화(Enable Hooks)" 체크박스를 선택합니다.
4. 훅은 반드시 실행 가능한 파일이어야 합니다 (Unix/Linux/macOS에서는 `chmod +x 훅이름` 사용).

## 사용 가능한 훅 (Available Hooks)

### TaskStart 훅
- **시점**: 새로운 태스크가 시작될 때 실행 (재개 시에는 실행되지 않음)
- **목적**: 태스크 컨텍스트 초기화, 태스크 요구 사항 검증, 환경 설정
- **글로벌 위치**: `~/Documents/Cline/Hooks/TaskStart`
- **워크스페이스 위치**: `.clinerules/hooks/TaskStart`

### TaskResume 훅
- **시점**: 기존 태스크가 재개될 때 실행 (사용자가 재개 버튼을 클릭한 후)
- **목적**: 재개된 태스크 상태 검증, 컨텍스트 복구, 마지막 실행 이후 변경 사항 확인
- **글로벌 위치**: `~/Documents/Cline/Hooks/TaskResume`
- **워크스페이스 위치**: `.clinerules/hooks/TaskResume`

### TaskCancel 훅
- **시점**: 태스크가 취소되거나 사용자가 훅을 중단했을 때 실행 (실제 활성 작업이 있거나 작업이 시작된 경우에만)
- **목적**: 리소스 정리, 취소 로그 기록, 상태 저장
- **글로벌 위치**: `~/Documents/Cline/Hooks/TaskCancel`
- **워크스페이스 위치**: `.clinerules/hooks/TaskCancel`
- **참고**: 이 훅은 취소할 수 없습니다.

### TaskComplete 훅 (출시 예정!)
- **시점**: 태스크가 완료로 표시될 때 실행
- **목적**: 완료 상태 기록, 최종 정리 수행, 보고서 생성
- **글로벌 위치**: `~/Documents/Cline/Hooks/TaskComplete`
- **워크스페이스 위치**: `.clinerules/hooks/TaskComplete`

### UserPromptSubmit 훅
- **시점**: 사용자가 프롬프트/메시지를 제출할 때 실행 (초기 태스크, 재개 또는 피드백)
- **목적**: 사용자 입력 검증, 프롬프트 전처리, 사용자 메시지에 컨텍스트 추가
- **글로벌 위치**: `~/Documents/Cline/Hooks/UserPromptSubmit`
- **워크스페이스 위치**: `.clinerules/hooks/UserPromptSubmit`

### PreToolUse 훅
- **시점**: 도구가 실행되기 직전에 실행
- **목적**: 파라미터 검증, 실행 차단 또는 컨텍스트 추가
- **글로벌 위치**: `~/Documents/Cline/Hooks/PreToolUse`
- **워크스페이스 위치**: `.clinerules/hooks/PreToolUse`

### PostToolUse 훅
- **시점**: 도구 실행이 완료된 직후에 실행
- **목적**: 결과 관찰, 패턴 추적 또는 컨텍스트 추가
- **글로벌 위치**: `~/Documents/Cline/Hooks/PostToolUse`
- **워크스페이스 위치**: `.clinerules/hooks/PostToolUse`

### PreCompact 훅 (출시 예정!)
- **시점**: 대화 컨텍스트가 압축/절단(compacted/truncated)되기 직전에 실행
- **목적**: 압축 이벤트 관찰, 컨텍스트 관리 로그 기록, 토큰 사용량 추적
- **글로벌 위치**: `~/Documents/Cline/Hooks/PreCompact`
- **워크스페이스 위치**: `.clinerules/hooks/PreCompact`

## 크로스 플랫폼 훅 형식 (Cross-Platform Hook Format)

Cline은 모든 플랫폼에서 일관되게 작동하는 git 스타일의 훅 방식을 사용합니다:

### 훅 파일 (모든 플랫폼)
- **파일 확장자 없음**: 훅 이름은 정확히 `PreToolUse` 또는 `PostToolUse`여야 합니다 (`.bat`, `.cmd`, `.sh` 등 확장자 없음).
- **Shebang 필수**: 첫 번째 줄은 반드시 셰방(shebang)으로 시작해야 합니다 (예: `#!/usr/bin/env bash` 또는 `#!/usr/bin/env node`).
- **Unix에서 실행 권한 필요**: Unix/Linux/macOS에서는 훅에 실행 권한이 있어야 합니다: `chmod +x PreToolUse`
- **Windows**: 현재 지원되지 않습니다.

### 작동 방식
git 훅과 마찬가지로, Cline은 셰방 라인을 해석하는 셸을 통해 훅 파일을 실행합니다:
- Unix/Linux/macOS: 셰방을 지원하는 네이티브 셸 실행

이는 다음을 의미합니다:
- ✅ 동일한 훅 스크립트가 모든 플랫폼에서 작동합니다.
- ✅ 한 번 작성하면 어디서나 실행됩니다.
- ✅ 모든 스크립트 언어(bash, node, python 등)를 사용할 수 있습니다.

### 훅 생성 방법

**Unix/Linux/macOS:**
```bash
# 훅 파일 생성
nano ~/Documents/Cline/Hooks/PreToolUse

# 실행 권한 부여
chmod +x ~/Documents/Cline/Hooks/PreToolUse
```

## 컨텍스트 주입 타이밍 (Context Injection Timing)

**중요**: 훅에 의해 주입된 컨텍스트는 현재 도구 실행이 아니라 **미래의 AI 결정**에 영향을 미칩니다.

### 이것이 중요한 이유

훅이 실행될 때:
1. AI는 이미 어떤 도구를 어떤 파라미터로 사용할지 결정한 상태입니다.
2. 훅은 해당 파라미터를 수정할 수 없습니다.
3. 훅의 컨텍스트는 대화에 추가됩니다.
4. AI는 **다음 API 요청**에서 이 컨텍스트를 확인하고 미래의 결정을 조정할 수 있습니다.

### PreToolUse 훅 흐름
```
1. AI 결정: "이 파라미터들로 write_to_file을 사용하겠다"
2. PreToolUse 훅 실행 → 실행을 차단하거나 컨텍스트를 추가함
3. 허용된 경우, 원래 파라미터로 도구 실행
4. 컨텍스트가 대화에 추가됨
5. 다음 API 요청에 이 컨텍스트가 포함됨
6. AI가 컨텍스트를 기반으로 향후 결정을 조정함
```

### PostToolUse 훅 흐름
```
1. 도구 실행 완료
2. PostToolUse 훅 실행 → 결과 관찰
3. 훅이 결과에 대한 컨텍스트 추가
4. 컨텍스트가 대화에 추가됨
5. 다음 API 요청에 이 컨텍스트가 포함됨
6. AI가 결과를 통해 학습할 수 있음
```

## 훅 입력/출력 (Hook Input/Output)

### 입력 (stdin을 통해 JSON으로 전달)

모든 훅은 다음 데이터를 받습니다:
```json
{
  "clineVersion": "string",
  "hookName": "TaskStart" | "TaskResume" | "TaskCancel" | "TaskComplete" | "UserPromptSubmit" | "PreToolUse" | "PostToolUse" | "PreCompact",
  "timestamp": "string",
  "taskId": "string",
  "workspaceRoots": ["string"],
  "userId": "string",
  "taskStart": {  // TaskStart 전용
    "taskMetadata": {
      "taskId": "string",
      "ulid": "string",
      "initialTask": "string"
    }
  },
  "taskResume": {  // TaskResume 전용
    "taskMetadata": {
      "taskId": "string",
      "ulid": "string"
    },
    "previousState": {
      "lastMessageTs": "string",
      "messageCount": "string",
      "conversationHistoryDeleted": "string"
    }
  },
  "taskCancel": {  // TaskCancel 전용
    "taskMetadata": {
      "taskId": "string",
      "ulid": "string",
      "completionStatus": "string"
    }
  },
  "taskComplete": {  // TaskComplete 전용
    "taskMetadata": {
      "taskId": "string",
      "ulid": "string"
    }
  },
  "userPromptSubmit": {  // UserPromptSubmit 전용
    "prompt": "string",
    "attachments": ["string"]
  },
  "preToolUse": {  // PreToolUse 전용
    "toolName": "string",
    "parameters": {}
  },
  "postToolUse": {  // PostToolUse 전용
    "toolName": "string",
    "parameters": {},
    "result": "string",
    "success": boolean,
    "executionTimeMs": number
  },
  "preCompact": {  // PreCompact 전용
    "contextSize": number,
    "messagesToCompact": number,
    "compactionStrategy": "string"
  }
}
```

### 출력 (stdout을 통해 JSON으로 반환)

모든 훅은 다음을 반환해야 합니다:
```json
{
  "cancel": boolean,                   // 필수: 계속하려면 false, 실행을 차단하려면 true
  "contextModification": "string",     // 선택사항: 향후 AI 결정을 위한 컨텍스트
  "errorMessage": "string"             // 선택사항: 차단 시 상세 에러 메시지
}
```

**참고**: `cancel` 필드는 다음과 같이 작동합니다:
- `false` (또는 생략): 실행을 계속 허용
- `true`: 실행을 차단하고 사용자에게 에러 메시지 표시

## 훅 실행 제한 (Hook Execution Limits)

- **타임아웃**: 훅은 30초 이내에 완료되어야 합니다 (`HOOK_EXECUTION_TIMEOUT_MS`를 통해 설정 가능).
- **컨텍스트 크기**: 컨텍스트 수정은 50KB로 제한됩니다 (`MAX_CONTEXT_MODIFICATION_SIZE`를 통해 설정 가능).
- **에러 처리**: 예상된 에러(파일 찾을 수 없음, 권한 거부, 디렉토리가 아님)는 자동으로 처리되며, 예상치 못한 파일 시스템 에러는 상위로 전달됩니다.

## 일반적인 사례 (Common Use Cases)

### 1. 유효성 검사 - 잘못된 작업 차단

```bash
#!/usr/bin/env bash
input=$(cat)
tool_name=$(echo "$input" | jq -r '.preToolUse.toolName')
path=$(echo "$input" | jq -r '.preToolUse.parameters.path // ""')

if [[ "$tool_name" == "write_to_file" && "$path" == *.js ]]; then
  cat <<EOF
{
  "cancel": true,
  "errorMessage": "TypeScript 프로젝트에서 .js 파일을 생성할 수 없습니다.",
  "contextModification": ".ts/.tsx 확장자만 사용하십시오."
}
EOF
  exit 0
fi

echo '{"cancel": false}'
```

### 2. 컨텍스트 구축 - 작업으로부터 학습

```bash
#!/usr/bin/env bash
input=$(cat)
tool_name=$(echo "$input" | jq -r '.postToolUse.toolName')
success=$(echo "$input" | jq -r '.postToolUse.success')
path=$(echo "$input" | jq -r '.postToolUse.parameters.path // ""')

if [[ "$tool_name" == "write_to_file" && "$success" == "true" ]]; then
  cat <<EOF
{
  "cancel": false,
  "contextModification": "'$path' 파일을 생성했습니다. 향후 작업에서도 이 파일의 패턴과 일관성을 유지하십시오."
}
EOF
else
  echo '{"cancel": false}'
fi
```

### 3. 성능 모니터링

```bash
#!/usr/bin/env bash
input=$(cat)
execution_time=$(echo "$input" | jq -r '.postToolUse.executionTimeMs')
tool_name=$(echo "$input" | jq -r '.postToolUse.toolName')

if [[ "$execution_time" -gt 5000 ]]; then
  cat <<EOF
{
  "cancel": false,
  "contextModification": "'$tool_name' 도구 실행에 ${execution_time}ms가 소요되었습니다. 향후 유사한 작업의 최적화를 고려하십시오."
}
EOF
else
  echo '{"cancel": false}'
fi
```

### 4. 로그 및 텔레메트리

```bash
#!/usr/bin/env bash
input=$(cat)

# 파일에 로그 기록
echo "$input" >> ~/.cline/hook-logs/tool-usage.jsonl

# 실행 허용
echo '{"cancel": false}'
```

## 글로벌 훅 vs 워크스페이스 훅

Cline은 두 가지 수준의 훅을 지원합니다:

### 글로벌 훅 (Global Hooks)
- **위치**: `~/Documents/Cline/Hooks/` (macOS/Linux)
- **범위**: 모든 워크스페이스와 프로젝트에 적용
- **사례**: 조직 전체 정책, 개인 선호도, 공통 유효성 검사
- **우선순위**: 워크스페이스 훅과 결합될 때 실행 순서가 보장되지 않음

### 워크스페이스 훅 (Workspace Hooks)
- **위치**: 각 워크스페이스 루트의 `.clinerules/hooks/`
- **범위**: 특정 워크스페이스에만 적용
- **사례**: 프로젝트 전용 규칙, 팀 컨벤션, 레포지토리 요구 사항
- **우선순위**: 글로벌 훅과 결합될 때 실행 순서가 보장되지 않음

### 훅 실행 방식

여러 개의 훅(글로벌 및/또는 워크스페이스)이 존재할 때:
- 해당 단계의 모든 훅은 `Promise.all`을 사용하여 **동시(concurrently)**에 실행됩니다.
- **실행 순서가 보장되지 않으며** 훅은 병렬로 실행됩니다.
- 모든 훅이 실행을 허용하면(`cancel: false`), 도구가 진행됩니다.
- 하나라도 실행을 차단하면(`cancel: true`), 실행이 중단됩니다.

**결과 병합 방식:**
- `cancel`: 하나라도 `true`를 반환하면 실행이 차단됩니다.
- `contextModification`: 모든 컨텍스트 문자열이 두 개의 줄바꿈(`\n\n`)으로 연결됩니다.
- `errorMessage`: 모든 에러 메시지가 하나의 줄바꿈(`\n`)으로 연결됩니다.

### 글로벌 훅 설정하기

1. 글로벌 훅 디렉토리는 다음 위치에 자동으로 생성됩니다:
   - macOS/Linux: `~/Documents/Cline/Hooks/`

2. 훅 스크립트를 추가합니다:
   ```bash
   # Unix/Linux/macOS
   nano ~/Documents/Cline/Hooks/PreToolUse
   chmod +x ~/Documents/Cline/Hooks/PreToolUse
   ```

3. Cline 설정에서 훅을 활성화합니다.

### 예시: 글로벌 + 워크스페이스 훅

**글로벌 훅** (모든 프로젝트 적용):
```bash
#!/usr/bin/env bash
# ~/Documents/Cline/Hooks/PreToolUse
# 범용 규칙: package.json 삭제 금지
input=$(cat)
tool_name=$(echo "$input" | jq -r '.preToolUse.toolName')
path=$(echo "$input" | jq -r '.preToolUse.parameters.path // ""')

if [[ "$tool_name" == "write_to_file" && "$path" == *"package.json"* ]]; then
  echo '{"cancel": true, "errorMessage": "글로벌 정책: package.json을 수정할 수 없습니다."}'
  exit 0
fi

echo '{"cancel": false}'
```

**워크스페이스 훅** (특정 프로젝트 적용):
```bash
#!/usr/bin/env bash
# .clinerules/hooks/PreToolUse
# 프로젝트 규칙: TypeScript 파일만 허용
input=$(cat)
tool_name=$(echo "$input" | jq -r '.preToolUse.toolName')
path=$(echo "$input" | jq -r '.preToolUse.parameters.path // ""')

if [[ "$tool_name" == "write_to_file" && "$path" == *.js ]]; then
  echo '{"cancel": true, "errorMessage": "프로젝트 규칙: .ts 파일 전용"}'
  exit 0
fi

echo '{"cancel": false}'
```

**도구구가 진행되려면 모든 훅이 실행을 허용해야 합니다.** 훅은 동시에 실행될 수 있습니다.

## 멀티 루트 워크스페이스 (Multi-Root Workspaces)

여러 개의 워크스페이스 루트가 있는 경우, 각 루트의 `.clinerules/hooks/` 디렉토리에 훅을 배치할 수 있습니다. 모든 훅(글로벌 및 워크스페이스)은 동시에 실행될 수 있으며 그 결과는 다음과 같이 병합됩니다:

- **cancel**: 하나라도 `true`를 반환하면 실행이 차단됩니다.
- **contextModification**: 모든 컨텍스트 수정 사항이 연결됩니다.
- **errorMessage**: 모든 에러 메시지가 연결됩니다.

**참고:** 서로 다른 디렉토리의 훅 간에는 실행 순서가 보장되지 않습니다.

## 문제 해결 (Troubleshooting)

### 훅이 실행되지 않음
- "훅 활성화(Enable Hooks)" 설정이 체크되어 있는지 확인하십시오.
- 훅 파일에 실행 권한이 있는지 확인하십시오 (`chmod +x 훅이름`).
- 훅 파일에 구문 오류가 없는지 확인하십시오.
- VSCode의 출력(Output) 패널(Cline 채널)에서 에러를 확인하십시오.

### 훅 타임아웃 발생
- 훅 스크립트의 복잡도를 줄이십시오.
- 비용이 많이 드는 작업(네트워크 호출, 과도한 계산 등)을 피하십시오.
- 복잡한 로직은 백그라운드 프로세스로 이동하는 것을 고려하십시오.

### 컨텍스트가 동작에 영향을 주지 않음
- 기억하십시오: 컨텍스트는 현재 도구가 아닌 **미래의 결정**에 영향을 줍니다.
- 컨텍스트 수정 내용이 명확하고 실행 가능한지 확인하십시오.
- 컨텍스트가 절단되지 않았는지 확인하십시오 (50KB 제한).

## 보안 고려 사항 (Security Considerations)

- 훅은 VSCode와 동일한 권한으로 실행됩니다.
- 신뢰할 수 없는 소스의 훅을 사용할 때는 주의하십시오.
- 활성화하기 전에 훅 스크립트를 검토하십시오.
- 민감한 훅 로직이 커밋되지 않도록 `.gitignore` 사용을 고려하십시오.
- 훅은 모든 워크스페이스 파일과 환경 변수에 접근할 수 있습니다.

## 권장 사항 (Best Practices)

1. **훅을 가볍게 유지** - 100ms 이내의 실행 시간을 목표로 하세요.
2. **실행 가능한 컨텍스트 제공** - AI가 무엇을 해야 할지 구체적으로 명시하세요.
3. **구조화된 접두사 사용** - AI가 컨텍스트를 분류할 때 도움이 됩니다.
4. **우아한 에러 처리** - 항상 유효한 JSON을 반환하게 하세요.
5. **디버깅을 위한 로깅** - 문제 해결을 위해 훅 실행 로그를 남기세요.
6. **점진적 테스트** - 간단한 훅부터 시작하여 점진적으로 복잡도를 높이세요.
7. **훅 문서화** - 목적과 로직을 설명하는 주석을 추가하세요.
