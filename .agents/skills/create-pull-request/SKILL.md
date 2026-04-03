---
name: create-pull-request
description: 프로젝트 규칙에 따라 GitHub 풀 리퀘스트(PR)를 생성합니다. 사용자가 PR 생성, 리뷰 요청, 또는 풀 리퀘스트 오픈을 요청할 때 사용하세요. 커밋 분석, 브랜치 관리, PR 템플릿 적용 및 gh CLI 도구를 이용한 PR 생성을 처리합니다.
---

# 풀 리퀘스트 생성 (Create Pull Request)

이 스킬은 프로젝트 규칙과 모범 사례를 따르는 구조화된 GitHub 풀 리퀘스트(PR) 생성을 안내합니다.

## 사전 확인 사항 (Prerequisites Check)

진행하기 전에 다음 사항을 확인하십시오:

### 1. `gh` CLI 설치 여부 확인

```bash
gh --version
```

설치되어 있지 않다면 사용자에게 안내하십시오:
> GitHub CLI (`gh`)가 필요하지만 설치되어 있지 않습니다. 다음 방법으로 설치해 주세요:
> - macOS: `brew install gh`
> - 기타: https://cli.github.com/

### 2. GitHub 인증 여부 확인

```bash
gh auth status
```

인증되지 않았다면 사용자에게 `gh auth login`을 실행하도록 안내하십시오.

### 3. 작업 디렉토리 상태 확인

```bash
git status
```

커밋되지 않은 변경 사항이 있다면 사용자에게 다음 중 하나를 선택하도록 묻습니다:
- 이 PR의 일부로 커밋
- 임시로 스태시(stash)
- 변경 사항 폐기 (주의 필요)

## 컨텍스트 수집 (Gather Context)

### 1. 현재 브랜치 식별

```bash
git branch --show-current
```

`main`이나 `master` 브랜치가 아닌지 확인하십시오. 만약 그렇다면, 사용자에게 기능 브랜치(feature branch)를 생성하거나 전환하도록 요청하십시오.

### 2. 베이스 브랜치(Base Branch) 찾기

```bash
git remote show origin | grep "HEAD branch"
```

대개 `main` 또는 `master`입니다.

### 3. 이 PR과 관련된 최근 커밋 분석

```bash
git log origin/main..HEAD --oneline --no-decorate
```

다음 사항을 이해하기 위해 커밋들을 검토하십시오:
- 어떤 변경 사항이 도입되는가
- PR의 범위 (단일 기능/수정 또는 여러 변경 사항)
- 커밋을 스쿼시(squash)하거나 재구성해야 하는지 여부

### 4. 차이점(diff) 확인

```bash
git diff origin/main..HEAD --stat
```

어떤 파일이 변경되었는지 보여주며 변경 유형을 식별하는 데 도움이 됩니다.

## 정보 수집 (Information Gathering)

PR을 생성하기 전에 다음 정보를 확인해야 합니다. 아래 항목에서 유추할 수 있는지 체크하세요:
- 커밋 메시지
- 브랜치 이름 (예: `fix/issue-123`, `feature/new-login`)
- 변경된 파일들과 그 내용

핵심 정보가 누락된 경우 `ask_followup_question`을 사용하여 사용자에게 묻습니다:

### 필수 정보 (Required Information)

1. **관련 이슈 번호**: 커밋 메시지에서 `#123`, `fixes #123`, `closes #123`과 같은 패턴을 찾습니다.
2. **설명**: 이 PR이 어떤 문제를 해결합니까? 왜 변경되었습니까?
3. **변경 유형**: 버그 수정, 새 기능, 파괴적 변경(breaking change), 리팩토링, UI 수정, 문서, 또는 워크플로우
4. **테스트 절차**: 어떻게 테스트되었습니까? 어떤 문제가 발생할 수 있습니까?

### 질문 예시

이슈 번호를 찾을 수 없는 경우:
> 커밋 메시지나 브랜치 이름에서 관련 이슈 번호를 찾을 수 없습니다. 이 PR이 해결하는 GitHub 이슈는 무엇인가요? (이슈 번호를 입력해 주세요. 예: "123". 작은 수정이라면 "N/A" 입력)

## Git 모범 사례 (Git Best Practices)

PR을 생성하기 전에 다음 사례들을 고려하십시오:

### 커밋 관리 (Commit Hygiene)

1. **원자적 커밋(Atomic commits)**: 각 커밋은 하나의 논리적 변경 사항을 나타내야 합니다.
2. **명확한 커밋 메시지**: 가능한 경우 Conventional Commits 형식을 따릅니다.
3. **머지 커밋 지양**: 히스토리를 깔끔하게 유지하기 위해 머지(merge) 대신 리베이스(rebase)를 권장합니다.

### 브랜치 관리 (Branch Management)

1. **최신 main 브랜치로 리베이스** (필요한 경우):
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **적절한 경우 스쿼시(Squash)**: 작은 "WIP" 커밋이 많은 경우 대화형 리베이스를 고려하십시오:
   ```bash
   git rebase -i origin/main
   ```
   커밋이 무분별하고 사용자가 리베이스에 익숙한 경우에만 제안하십시오.

### 변경 사항 푸시 (Push Changes)

모든 커밋이 푸시되었는지 확인하십시오:
```bash
git push origin HEAD
```

리베이스를 수행했다면 다음이 필요할 수 있습니다:
```bash
git push origin HEAD --force-with-lease
```

## 풀 리퀘스트 생성 (Create the Pull Request)

**중요**: `.github/pull_request_template.md`에 있는 PR 템플릿을 읽고 사용하십시오. PR 본문 형식은 **템플릿 구조와 반드시 일치**해야 합니다. 템플릿 형식을 벗어나지 마십시오.

템플릿을 작성할 때:
- `#XXXX`를 실제 이슈 번호로 바꾸십시오. 이슈가 없다면 `#XXXX`를 유지하십시오 (작은 수정의 경우).
- 커밋과 컨텍스트에서 수집한 관련 정보로 모든 섹션을 채우십시오.
- 해당되는 "변경 유형(Type of Change)" 체크박스에 표시하십시오.
- 해당되는 "사전 점검 리스트(Pre-flight Checklist)" 항목을 완료하십시오.

### gh CLI로 PR 생성

셸 이스케이트 이슈, 줄바꿈 문제 및 기타 명령행 오류를 피하기 위해 **PR 본문 작성 시 임시 파일을 사용**하십시오:

1. PR 본문을 임시 파일에 씁니다:
   ```
   /tmp/pr-body.md
   ```

2. 파일을 사용하여 PR을 생성합니다:
   ```bash
   gh pr create --title "PR_제목" --body-file /tmp/pr-body.md --base main
   ```

3. 임시 파일을 삭제합니다:
   ```bash
   rm /tmp/pr-body.md
   ```

초안(Draft) PR의 경우:
```bash
gh pr create --title "PR_제목" --body-file /tmp/pr-body.md --base main --draft
```

**왜 파일을 사용하나요?** 줄바꿈, 특수 문자, 체크박스가 포함된 복잡한 마크다운을 `--body`로 직접 전달하면 오류가 발생하기 쉽습니다. `--body-file` 플래그는 모든 콘텐츠를 안정적으로 처리합니다.

## 생성 후 작업 (Post-Creation)

PR 생성 후:

1. 사용자가 리뷰할 수 있도록 **PR URL을 표시**합니다.
2. **CI 체크 안내**: 테스트와 린팅(linting)이 자동으로 실행될 것임을 알립니다.
3. **다음 단계 제안**:
   - 필요한 경우 리뷰어 추가: `gh pr edit --add-reviewer 사용자이름`
   - 필요한 경우 라벨 추가: `gh pr edit --add-label "bug"`

## 에러 핸들링 (Error Handling)

### 일반적인 문제

1. **main 브랜치보다 앞선 커밋 없음**: 제출할 변경 사항이 브랜치에 없습니다.
   - 사용자가 다른 브랜치에서 작업하려 했던 것인지 확인합니다.

2. **브랜치가 푸시되지 않음**: 원격 저장소에 해당 브랜치가 없습니다.
   - 먼저 브랜치를 푸시합니다: `git push -u origin HEAD`

3. **PR이 이미 존재함**: 이 브랜치에 대한 PR이 이미 존재합니다.
   - 기존 PR을 보여줍니다: `gh pr view`
   - 대신 업데이트를 원하는지 묻습니다.

4. **머지 충돌(Merge conflicts)**: 브랜치가 베이스 브랜치와 충돌합니다.
   - 충돌 해결 또는 리베이스 과정을 사용자에게 안내합니다.

## 요약 체크리스트 (Summary Checklist)

최종 완료 전에 다음을 확인하십시오:
- [ ] `gh` CLI가 설치되고 인증됨
- [ ] 작업 디렉토리가 깨끗함
- [ ] 모든 커밋이 푸시됨
- [ ] 브랜치가 베이스 브랜치와 동기화됨
- [ ] 관련 이슈 번호가 확인되었거나 플레이스홀더가 사용됨
- [ ] PR 설명이 템플릿을 정확히 따름
- [ ] 적절한 변경 유형이 선택됨
- [ ] 사전 점검 리스트 항목이 처리됨