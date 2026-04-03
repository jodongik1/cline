# 네트워킹 및 프록시 지원 (Networking & Proxy Support)

Cline이 모든 환경(VSCode, JetBrains, CLI)에서 다양한 네트워크 구성(특히 기업용 프록시)과 함께 올바르게 작동하도록 모든 네트워크 활동에 대해 다음 지침을 엄격히 준수하십시오.

익스텐션 코드에서는 전역 `fetch`나 기본 `axios` 인스턴스를 사용하지 마십시오. (단, `shared/net.ts`는 fetch 래퍼를 설정하는 곳이므로 이 규칙에서 제외됩니다.) 웹뷰(Webview) 코드에서는 전역 `fetch`를 사용해야 합니다.

전역 `fetch`와 기본 `axios`는 모든 환경(특히 JetBrains 및 CLI)에서 프록시 설정을 자동으로 감지하지 못합니다. 반드시 프록시 에이전트 구성을 처리하는 `@/shared/net`에서 제공하는 유틸리티를 사용해야 합니다. 웹뷰에서는 브라우저 또는 임베더(embedder)가 프록시를 처리합니다.

## 지침 (Guidelines)

### 1. `fetch` 사용법

`fetch(...)` 대신 프록시를 인식하는 래퍼(wrapper)를 임포트하십시오:

```typescript
import { fetch } from '@/shared/net'

// 사용법은 전역 fetch와 동일합니다.
const response = await fetch('https://api.example.com/data')
```

### 2. `axios` 사용법

`axios`를 사용할 때는 `getAxiosSettings()`의 설정을 적용해야 합니다:

```typescript
import axios from 'axios'
import { getAxiosSettings } from '@/shared/net'

const response = await axios.get('https://api.example.com/data', {
  headers: { 'Authorization': '...' },
  ...getAxiosSettings() // <--- 중요: 필요한 경우 프록시 에이전트를 주입합니다.
})
```

### 3. 서드파티 클라이언트 (OpenAI, Ollama 등)

대부분의 API 클라이언트 라이브러리는 `fetch` 구현을 커스터마이징할 수 있게 해줍니다. 이 클라이언트들에 반드시 프록시를 인식하는 `fetch`를 전달해야 합니다.

**예시 (OpenAI):**
```typescript
import OpenAI from "openai"
import { fetch } from "@/shared/net"

this.client = new OpenAI({
  apiKey: '...',
  fetch, // <--- 중요: 우리의 fetch 래퍼를 전달합니다.
})
```

### 4. 테스트 (Tests)

내부의 fetch 구현을 모킹(mock)하려면 `mockFetchForTesting`을 사용하십시오.

**예시 (콜백):**

```typescript
import { mockFetchForTesting } from "@/shared/net"

...
  let mockFetch = ...
  mockFetchForTesting(mockFetch, () => {
    // 이것은 mockFetch를 호출합니다.
    fetch('https://foo.example').then(...)
  })
  // 호출이 반환되면 즉시 원래의 fetch로 복구됩니다.
```

**예시 (Promise):**

```typescript
import { mockFetchForTesting } from "@/shared/net"

...
  let mockFetch = ...
  await mockFetchForTesting(mockFetch, async () => {
    await ...
    // 이것은 mockFetch를 호출합니다.
    await fetch('https://foo.example')
    ...
  })
  // 콜백의 Promise가 해결될 때 원래의 fetch로 복구됩니다.
```

## 검증 (Verification)

새로운 네트워크 호출이나 통합 기능을 추가하는 경우:
1. `@/shared/net.ts`가 임포트되었는지 확인합니다.
2. `fetch` 또는 `getAxiosSettings`가 사용되고 있는지 확인합니다.
3. 서드파티 클라이언트가 커스텀 fetch를 사용하도록 구성되었는지 확인합니다.
