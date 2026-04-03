당신은 `gh` 터미널 명령어를 사용할 수 있습니다. 이미 인증을 완료해 두었습니다. 제가 리뷰를 요청한 PR이 무엇인지 확인하고 리뷰를 진행하십시오. 현재 `cline` 저장소에 위치해 있습니다.

<detailed_sequence_of_steps>
# GitHub PR 리뷰 프로세스 - 상세 단계

## 1. PR 정보 수집
1. PR 제목, 내용, 코멘트를 가져옵니다:
   ```bash
   gh pr view <PR-번호> --json title,body,comments
   ```

2. PR의 전체 차이점(diff)을 가져옵니다:
   ```bash
   gh pr diff <PR-번호>
   ```

## 2. 컨텍스트 이해
1. PR에서 수정된 파일들이 무엇인지 확인합니다:
   ```bash
   gh pr view <PR-번호> --json files
   ```

2. main 브랜치의 원본 파일을 살펴보고 맥락을 이해합니다:
   ```xml
   <read_file>
   <path>path/to/file</path>
   </read_file>
   ```

3. 파일의 특정 섹션에 대해서는 search_files를 사용할 수 있습니다:
   ```xml
   <search_files>
   <path>path/to/directory</path>
   <regex>검색어</regex>
   <file_pattern>*.ts</file_pattern>
   </search_files>
   ```

## 3. 변경 사항 분석
1. 수정된 각 파일에 대해 다음을 파악합니다:
   - 무엇이 변경되었는가
   - 왜 변경되었는가 (PR 설명 기반)
   - 코드베이스에 어떤 영향을 미치는가
   - 잠재적인 부작용

2. 다음 사항들을 확인합니다:
   - 코드 품질 문제
   - 잠재적 버그
   - 성능 영향
   - 보안 우려 사항
   - 테스트 커버리지

## 4. 사용자 확인 요청
1. 결정을 내리기 전에, 자신의 평가와 근거를 제시하며 사용자에게 PR을 승인할지 확인합니다:
   ```xml
   <ask_followup_question>
   <question>PR #<PR-번호>에 대한 리뷰 결과, [승인/변경 요청]을 권장합니다. 이유는 다음과 같습니다:
   
   [PR 품질, 구현 방식 및 우려 사항에 대한 상세한 근거]
   
   이 권장 사항대로 진행할까요?</question>
   <options>["예, PR을 승인합니다", "예, 변경을 요청합니다", "아니요, 더 논의하고 싶습니다"]</options>
   </ask_followup_question>
   ```

## 5. 코멘트 초안 작성 여부 확인
1. 사용자가 승인/거절을 결정한 후, 코멘트 초안을 작성할지 묻습니다:
   ```xml
   <ask_followup_question>
   <question>이 PR에 대해 바로 복사해서 붙여넣을 수 있는 코멘트 초안을 작성해 드릴까요?</question>
   <options>["예, 코멘트 초안을 작성해 주세요", "아니요, 제가 직접 작성하겠습니다"]</options>
   </ask_followup_question>
   ```

2. 사용자가 코멘트 초안을 원하는 경우, 구성이 잘 잡힌 코멘트를 제공합니다:
   ```
   PR 감사합니다! 리뷰 결과는 다음과 같습니다:

   [PR 품질, 구현 방식 및 제안 사항에 대한 상세 평가]

   [코드 품질, 기능 및 테스트에 대한 구체적인 피드백 포함]
   ```

## 6. 결정 내리기
1. 품질 기준을 충족하면 PR을 승인합니다:
   ```bash
   # 단일 라인 코멘트의 경우:
   gh pr review <PR-번호> --approve --body "승인 메시지"
   
   # 공백 포맷이 포함된 다중 라인 코멘트의 경우:
   cat << EOF | gh pr review <PR-번호> --approve --body-file -
   @username님, PR 감사합니다! 구현이 깔끔하네요.
   
   특히 X와 Y를 처리한 방식이 마음에 듭니다.
   
   수고하셨습니다!
   EOF
   ```

2. 개선이 필요한 경우 변경을 요청합니다:
   ```bash
   # 단일 라인 코멘트의 경우:
   gh pr review <PR-번호> --request-changes --body "피드백 메시지"
   
   # 공백 포맷이 포함된 다중 라인 코멘트의 경우:
   cat << EOF | gh pr review <PR-번호> --request-changes --body-file -
   @username님, PR 감사합니다!
   
   구현 방향은 좋으나, 몇 가지 해결해야 할 사항이 있습니다:
   
   1. 문제점 하나
   2. 문제점 둘
   
   이 사항들을 수정해 주시면 머지(merge)하도록 하겠습니다.
   EOF
   ```

   참고: `cat << EOF | ... --body-file -` 방식은 임시 파일 없이도 모든 공백과 포맷을 유지합니다. `-` 파라미터는 표준 입력으로부터 읽으라는 의미입니다.
</detailed_sequence_of_steps>

<example_review_process>
# PR 리뷰 프로세스 예시

Claude 3.7 모델의 thinking mode 계산 방식을 수정하는 PR #3627을 리뷰하는 실제 예시를 살펴보겠습니다.

## 1단계: PR 정보 수집

```bash
# PR 상세 정보 가져오기
gh pr view 3627 --json title,body,comments

# 전체 diff 가져오기
gh pr diff 3627
```

## 2단계: 컨텍스트 이해

```xml
# 원본 파일을 살펴보고 무엇이 변경되는지 이해
<read_file>
<path>src/shared/api.ts</path>
</read_file>

# ThinkingBudgetSlider 컴포넌트 구현 확인
<read_file>
<path>webview-ui/src/components/settings/ThinkingBudgetSlider.tsx</path>
</read_file>

# API 프로바이더에서 thinking mode가 현재 어떻게 처리되는지 검색
<search_files>
<path>src/api/providers</path>
<regex>reasoningOn</regex>
<file_pattern>*.ts</file_pattern>
</search_files>
```

## 3단계: 변경 사항 분석

PR 정보와 코드 검토를 통해 다음 사항을 확인할 수 있습니다:

1. 이 PR은 Claude 3.7 모델의 thinking mode 예산 계산 문제를 수정합니다.
2. 현재 thinking budget이 maxTokens(8192)의 80%인 6553 토큰으로 잘못 계산되고 있습니다.
3. 실제 Claude 3.7은 훨씬 더 큰 thinking budget(최대 64000 토큰)을 지원합니다.
4. PR은 모델 정의에 `maxBudget: 64000`을 가진 `thinkingConfig` 속성을 추가합니다.
5. reasoning 모드가 활성화될 때 이 값을 사용하도록 API 핸들러를 업데이트합니다.
6. 모델별 퍼센티지를 기반으로 최대값을 계산하도록 슬라이더 컴포넌트를 개선합니다.
7. 계산 로직을 검증하기 위해 포괄적인 테스트가 추가되었습니다.

## 4단계: 사용자 확인 요청

```xml
<ask_followup_question>
<question>PR #3627을 리뷰한 결과, 승인을 권장합니다. 이유는 다음과 같습니다:

1. Claude 3.7 모델의 thinking mode 예산 계산 오류를 정확히 수정했습니다.
2. Claude 3.7 모델에 대해 thinkingConfig.maxBudget 속성(64000)을 적절히 구현했습니다.
3. 슬라이더 계산 시 적절한 퍼센티지(50%)를 적용했습니다.
4. 포괄적인 유닛 테스트를 통해 변경 사항이 잘 검증되었습니다.
5. 구현이 깔끔하며 프로젝트의 코딩 표준을 잘 따르고 있습니다.
6. 수정을 증명하는 유용한 스크린샷이 PR에 포함되어 있습니다.

이 PR의 승인을 진행할까요?</question>
<options>["예, PR을 승인합니다", "아니요, 더 논의하고 싶습니다", "제가 직접 먼저 검토하겠습니다"]</options>
</ask_followup_question>
```

## 5단계: 코멘트 초안 작성 여부 확인

```xml
<ask_followup_question>
<question>이 PR에 대해 바로 복사해서 붙여넣을 수 있는 코멘트 초안을 작성해 드릴까요?</question>
<options>["예, 코멘트 초안을 작성해 주세요", "아니요, 제가 직접 작성하겠습니다"]</options>
</ask_followup_question>
```

## 6단계: 결정 내리기

```bash
# 옵션 1: 단순 단일 라인 코멘트
gh pr review 3627 --approve --body "PR 좋아 보이네요! Claude 3.7 모델의 thinking mode 예산 계산 오류를 정확히 수정했습니다."

# 옵션 2: 공백 포맷이 포함된 다중 라인 코멘트
cat << EOF | gh pr review 3627 --approve --body-file -
PR 좋아 보이네요! Claude 3.7 모델의 thinking mode 예산 계산 오류를 정확히 수정했습니다.

특히 다음 사항들이 마음에 듭니다:
1. thinkingConfig.maxBudget 속성(64000)의 적절한 구현
2. 슬라이더 계산을 위한 적절한 퍼센티지(50%) 적용
3. 포괄적인 유닛 테스트 포함
4. 프로젝트 코딩 표준을 따르는 깔끔한 구현

수고하셨습니다!
EOF
```
</example_review_process>

<common_gh_commands>
# PR 리뷰를 위한 주요 GitHub CLI 명령어

## 기본 PR 명령어
```bash
# 현재 PR 번호 확인
gh pr view --json number -q .number

# 열려 있는 PR 목록 조회
gh pr list

# 특정 PR 보기
gh pr view <PR-번호>

# 특정 필드와 함께 PR 보기
gh pr view <PR-번호> --json title,body,comments,files,commits

# PR 상태 확인
gh pr status
```

## Diff 및 파일 명령어
```bash
# PR의 전체 차이점(diff) 가져오기
gh pr diff <PR-번호>

# PR에서 변경된 파일 목록 조회
gh pr view <PR-번호> --json files

# 로컬로 PR 체크아웃
gh pr checkout <PR-번호>
```

## 리뷰 명령어
```bash
# PR 승인 (단일 라인 코멘트)
gh pr review <PR-번호> --approve --body "승인 메시지"

# PR 승인 (공백 유지를 위한 다중 라인 코멘트)
cat << EOF | gh pr review <PR-번호> --approve --body-file -
여러 줄의
승인 메시지를
공백 포맷과 함께 작성
EOF

# PR 변경 요청 (단일 라인 코멘트)
gh pr review <PR-번호> --request-changes --body "피드백 메시지"

# PR 변경 요청 (공백 유지를 위한 다중 라인 코멘트)
cat << EOF | gh pr review <PR-번호> --request-changes --body-file -
여러 줄의
변경 요청 메시지를
공백 포맷과 함께 작성
EOF

# 승인/거절 없이 코멘트만 추가
gh pr review <PR-번호> --comment --body "코멘트 메시지"

# 공백 유지를 위한 다중 라인 코멘트 리뷰
cat << EOF | gh pr review <PR-번호> --comment --body-file -
여러 줄의
코멘트를
공백 포맷과 함께 작성
EOF
```

## 기타 명령어
```bash
# PR 체크(checks) 상태 조회
gh pr checks <PR-번호>

# PR 커밋 목록 조회
gh pr view <PR-번호> --json commits

# PR 머지 (권한이 있는 경우)
gh pr merge <PR-번호> --merge
```
</common_gh_commands>

<general_guidelines_for_commenting>
PR을 리뷰할 때는 평소처럼 자연스럽고 친절한 리뷰어처럼 대화하십시오. 요점은 간결하게 유지하고, 작성자에게 감사를 표하며 @ 언급으로 시작하십시오.

PR 승인 여부와 관계없이, 변경 사항에 대해 너무 장황하거나 확정적이지 않게 요약해 주십시오. 마치 지금 제가 당신에게 말하는 것처럼, 이것이 당신이 이해한 변경 사항이라는 점을 겸허하게 전달하십시오.

제안 사항이 있거나 변경해야 할 사항이 있다면 승인 대신 변경 요청을 하십시오.

코드 내에 인라인 코멘트를 남기는 것이 좋지만, 특정 코드에 대해 할 말이 있을 때만 하십시오. 먼저 인라인 코멘트들을 남긴 후, PR 전체에 대해 변경을 요청하는 짧은 코멘트로 여러분이 요청하는 변경 사항의 전반적인 테마를 설명하며 마무리하십시오.
</general_guidelines_for_commenting>

<example_comments_that_i_have_written_before>
<brief_approve_comment>
좋아 보이네요. 다만 언젠가 모든 프로바이더와 모델에 대해 제네릭하게 만들 필요가 있겠어요.
</brief_approve_comment>
<brief_approve_comment>
OR/Gemini 간에 일치하지 않을 수 있는 모델들(예: thinking 모델)에서도 이게 작동할까요?
</brief_approve_comment>
<approve_comment>
정말 좋네요! 글로벌 엔드포인트 지원을 처리한 방식이 마음에 듭니다. ModelInfo 인터페이스에 추가한 것은 다른 모델 기능들처럼 처리되는 것이라 완전히 타당해 보여요.

하드코딩하지 않고 필터링된 모델 목록 방식을 택한 덕분에 유지보수가 훨씬 쉬워질 것 같습니다. 그리고 genai 라이브러리 버전업은 당연히 필요했던 작업이었네요.

제한 사항에 대한 문서도 추가해 주셔서 감사합니다. 글로벌 엔드포인트에서는 컨텍스트 캐시를 못 쓰지만 429 에러는 줄어들 수 있다는 걸 사용자가 아는 게 중요하니까요.
</approve_comment>
<request_changes_comment>
멋지네요. 감사합니다 @scottsus님.

다만 제 주요 우려 사항은 - 이게 모든 VS Code 테마에서 잘 돌아갈까요? 초기에 이 문제로 고생을 좀 해서 현재 스타일이 매우 단순하게만 되어 있거든요. 머지하기 전에 다양한 테마에서의 스크린샷을 찍어서 테스트 결과 공유 부탁드립니다.
</request_changes_comment>
<request_changes_comment>
안녕하세요, PR 전체적으로 좋아 보이지만 타임아웃을 제거한 부분이 걱정되네요. 아마 이유가 있어서 넣었을 텐데, VS Code UI는 타이밍에 따라 상당히 민감하게 반응할 수 있거든요.

사이드바 포커싱 후에 타임아웃을 다시 추가해 주실 수 있을까요? 예를 들면:

```typescript
await vscode.commands.executeCommand("claude-dev.SidebarProvider.focus")
await setTimeoutPromise(100)  // UI 업데이트 시간 확보
visibleWebview = WebviewProvider.getSidebarInstance()
```
</request_changes_comment>
<request_changes_comment>
안녕하세요 @alejandropta님, 작업해 주셔서 감사합니다!

몇 가지 메모:
1 - 환경 변수에 추가적인 정보를 넣는 건 상당히 조심스럽습니다. 환경 변수는 **모든 단일 메시지**에 포함되기 때문이죠. 이 특수한 사용 사례를 위해 감수할 만한 가치가 있는지 의문입니다.
2 - 설정을 통해 선택할 수 있게 하는 옵션도 있겠지만, 우리는 설정 페이지가 신규 사용자에게 최대한 단순하고 직관적이길 원합니다.
3 - 현재 설정 페이지의 시각화 방식 및 구성을 전면 개편 중인데, 그 작업이 완료되어 설정 페이지가 더 명확히 정리된 후에 이 기능을 다시 고려해볼 수 있을 것 같습니다.

따라서 설정 페이지가 업데이트되고 신규 사용자에게 혼란을 주지 않는 깔끔한 방식으로 이 기능이 추가될 때까지는 머지가 어려울 것 같습니다. 양해 부탁드립니다.
</request_changes_comment>
<request_changes_comment>
아키텍처 변경은 탄탄하네요 - 포커스 로직을 커맨드 핸들러로 옮긴 건 말이 됩니다. Just don't want to introduce subtle timing issues by removing those timeouts.
</request_changes_comment>
</example_comments_that_i_have_written_before>
