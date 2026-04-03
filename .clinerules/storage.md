# 스토리지 아키텍처 (Storage Architecture)

글로벌 설정, 비밀값(secrets) 및 워크스페이스 상태는 `~/.cline/data/` 아래의 **파일 기반 JSON 저장소**에 저장됩니다. 이는 VSCode, CLI 및 JetBrains에서 사용하는 공유 스토리지 계층입니다.

## 핵심 추상화 (Key Abstractions)

### `StorageContext` (src/shared/storage/storage-context.ts)
진입점입니다. `createStorageContext()`를 통해 생성되어 `StateManager.initialize()`에 전달됩니다. 세 개의 `ClineFileStorage` 인스턴스를 포함합니다:
- `globalState` → `~/.cline/data/globalState.json`
- `secrets` → `~/.cline/data/secrets.json` (권한 0o600)
- `workspaceState` → `~/.cline/data/workspaces/<hash>/workspaceState.json`

### `ClineFileStorage` (src/shared/storage/ClineFileStorage.ts)
단일 파일에 기반한 동기식 JSON 키-값 저장소입니다. `get()`, `set()`, `setBatch()`, `delete()`를 지원합니다. 쓰기 작업은 원자적(atomic)입니다 (파일 작성 후 이름 변경 방식).

### `StateManager` (src/core/storage/StateManager.ts)
`StorageContext` 위의 인메모리 캐시입니다. 모든 런타임 읽기는 캐시를 통해 이루어지며, 쓰기는 캐시를 즉시 업데이트하고 디바운스(debounce) 처리되어 디스크에 반영됩니다.

## ⚠️ 스토리지에 VSCode의 ExtensionContext를 사용하지 마십시오

영구 데이터를 위해 `context.globalState`, `context.workspaceState`, 또는 `context.secrets`를 읽거나 쓰지 **마십시오**. 이들은 VSCode 전용이며 CLI나 JetBrains에서는 사용할 수 없습니다.

대신 다음을 사용하십시오:
```typescript
// 상태 읽기
StateManager.get().getGlobalStateKey("myKey")
StateManager.get().getSecretKey("mySecretKey")
StateManager.get().getWorkspaceStateKey("myWsKey")

// 상태 쓰기
StateManager.get().setGlobalState("myKey", value)
StateManager.get().setSecret("mySecretKey", value)
StateManager.get().setWorkspaceState("myWsKey", value)
```

데이터를 작성한 클라이언트와 읽는 클라이언트가 다를 수 있음을 기억하십시오. 예를 들어, JetBrains의 Cline에서 작성한 값이 Cline CLI에서 읽힐 수 있습니다.

## VSCode 마이그레이션 (src/hosts/vscode/vscode-to-file-migration.ts)

VSCode 시작 시, VSCode의 `ExtensionContext` 스토리지에서 파일 기반 저장소로 데이터를 복사하는 마이그레이션이 실행됩니다. 이 작업은 `src/common.ts`에서 `StateManager.initialize()` 이전에 수행됩니다.

- **센티널(Sentinel)**: 글로벌 상태 및 워크스페이스 상태의 `__vscodeMigrationVersion` 키 — 중복 마이그레이션을 방지합니다.
- **병합 전략**: 파일 저장소가 우선권을 갖습니다. 기존 값은 절대 덮어쓰지 않습니다.
- **안전한 다운그레이드**: VSCode 스토리지는 삭제되지 않으므로, 이전 버전의 익스텐션도 여전히 작동합니다.

## 새로운 스토리지 키 추가하기

1. `src/shared/storage/state-keys.ts`에 추가하십시오 (기존 패턴 참고).
2. `StateManager`를 통해 읽고 쓰십시오 (`context.globalState` 사용 금지).
3. 비밀값(secret)을 추가하는 경우, `state-keys.ts`의 `SecretKeys` 배열에 추가하십시오.

## 파일 레이아웃

```
~/.cline/
  data/
    globalState.json          # 글로벌 설정 및 상태
    secrets.json              # API 키 (권한 0o600)
    tasks/
      taskHistory.json        # 태스크 히스토리 (별도 파일)
    workspaces/
      <hash>/
        workspaceState.json   # 워크스페이스별 토글 설정
```
