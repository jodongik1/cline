# 핫픽스 릴리스 (Hotfix Release)

main 브랜치에서 특정 커밋들을 체리픽(cherry-pick)하여 최신 릴리스 태그에 적용하고 핫픽스 릴리스를 생성합니다.

## 개요 (Overview)

이 워크플로우는 다음 과정을 도와줍니다:
1. 핫픽스에 포함할 특정 커밋들을 main에서 선택
2. main 브랜치에 릴리스 노트 커밋 생성 (변경 이력 업데이트 + 버전 올림)
3. 모든 내용을 최신 릴리스 태그로 체리픽
4. 새로운 릴리스 태그 생성 및 푸시(push)

## 1단계: 설정 및 정보 수집 (Setup and Gather Information)

먼저, main 브랜치로 이동하여 최신 상태로 업데이트합니다:

```bash
git checkout main && git pull origin main
```

최신 릴리스 태그를 가져옵니다:

```bash
git tag --sort=-v:refname | head -1
```

## 2단계: 마지막 릴리스 이후의 커밋 제시 (Present Commits Since Last Release)

마지막 릴리스 태그 이후 main 브랜치에 쌓인 모든 커밋을 표시합니다:

```bash
LAST_TAG=$(git tag --sort=-v:refname | head -1)
git log ${LAST_TAG}..HEAD --oneline --format="%h %s (%an)"
```

또한 해당 태그에 이미 포함된 커밋 메시지들도 가져옵니다 (이전에 체리픽된 커밋 식별용). 주의: 작성자 이름에 괄호가 포함된 경우 셸 파싱 문제를 피하기 위해 별도의 명령으로 실행하십시오:

```bash
LAST_TAG=$(git tag --sort=-v:refname | head -1)
PREV_TAG=$(git tag --sort=-v:refname | head -2 | tail -1)
```

```bash
git log $PREV_TAG..$LAST_TAG --oneline --format="%s"
```

커밋 해시, 제목, 작성자가 포함된 번호 매겨진 목록을 **사용자에게 제시**합니다. 해당 태그의 히스토리에 이미 제목이 존재하는 커밋(이전 핫픽스에서 이미 체리픽됨)이나 "Release Notes" 커밋의 경우, 뒤에 `(이전 핫픽스에 이미 포함됨)` 또는 `(릴리스 노트 - 건너뜀)`을 추가하여 사용자가 건너뛸 수 있도록 안내합니다.

핫픽스에 포함할 커밋이 무엇인지 묻습니다.

`ask_followup_question` 도구를 사용하여 사용자가 원하는 커밋(번호 또는 해시)을 지정하게 합니다.

## 3단계: 선택된 커밋 분석 (Analyze Selected Commits)

선택된 각 커밋에 대해:
1. 전체 커밋 메시지 확인: `git show --no-patch --format="%B" <hash>`
2. 변경 사항 이해를 위한 diff 확인: `git show <hash> --stat`
3. 연관된 PR 확인 (있는 경우): `gh pr list --search "<hash>" --state merged --json number,title --jq '.[0]'`

변경 이력(changelog) 작성을 위해 이 변경 사항들이 무엇을 하는지 머릿속으로 정리합니다.

## 4단계: 새 버전 번호 결정 (Determine New Version Number)

package.json과 마지막 태그에서 현재 버전을 파악합니다:

```bash
LAST_TAG=$(git tag --sort=-v:refname | head -1)
echo "마지막 릴리스: $LAST_TAG"
cat package.json | grep '"version"'
```

핫픽스는 항상 패치 버전(patch version)을 올립니다 (예: 3.40.0 -> 3.40.1, 또는 3.40.1 -> 3.40.2).

**사용자에게 새 버전 번호를 확인해달라고 요청합니다.**

## 5단계: Main 브랜치에 릴리스 노트 커밋 생성 (Create Release Notes Commit on Main)

main 브랜치에서 다음 사항들을 업데이트하는 커밋을 생성합니다:

1. **CHANGELOG.md** - 맨 위에 핫픽스 버전을 위한 새 섹션을 추가합니다:
   ```markdown
   ## [3.40.1]

   - 수정 사항 1에 대한 설명
   - 수정 사항 2에 대한 설명
   ```

   커밋 분석 내용을 바탕으로 명확하고 사용자 친화적인 설명을 작성합니다.

2. **package.json** - version 필드를 새 버전으로 업데이트합니다.

3. changelog-entry 파일 정리 작업은 필요하지 않습니다. 이 프로젝트의 기여자는 changelog-entry 파일을 생성하지 않습니다.

**`npm run install:all` 실행은 건너뜁니다.** - 릴리스 자동화 도구가 필요에 따라 lockfile 일관성을 처리합니다.

커밋 메시지 형식: `v{VERSION} Release Notes (hotfix)`

커밋 본문에는 다음 내용을 언급합니다:
- 이것이 핫픽스 릴리스임을 명시
- 포함될 체리픽된 커밋 목록

```bash
git add CHANGELOG.md package.json
git commit -m "v3.40.1 Release Notes (hotfix)

다음 내용을 포함한 핫픽스 릴리스:
- <commit1-hash>: <설명>
- <commit2-hash>: <설명>
"
```

main 브랜치에 푸시합니다:

```bash
git push origin main
```

## 6단계: 태그에서 핫픽스 빌드 (Build the Hotfix on the Tag)

마지막 릴리스 태그로 체크아웃합니다 (detached HEAD):

```bash
LAST_TAG=$(git tag --sort=-v:refname | head -1)
git checkout $LAST_TAG
```

선택한 커밋들을 순서대로 체리픽합니다:

```bash
git cherry-pick <commit1-hash>
git cherry-pick <commit2-hash>
# ... 등등
```

마지막으로, 방금 main에 푸시한 릴리스 노트 커밋을 체리픽합니다:

```bash
# 릴리스 노트 커밋의 해시를 가져옵니다 (main의 HEAD여야 함)
RELEASE_NOTES_COMMIT=$(git rev-parse main)
git cherry-pick $RELEASE_NOTES_COMMIT
```

## 7단계: 태그 생성 및 푸시 (Tag and Push)

모든 체리픽이 성공적으로 적용된 후:

```bash
# 새 릴리스 태그 생성
git tag v{VERSION}

# 원격 저장소에 태그 푸시
git push origin v{VERSION}
```

## 8단계: Main 브랜치 복귀 및 요약 (Return to Main and Summary)

main 브랜치로 돌아갑니다:

```bash
git checkout main
```

각 수정 사항에 대한 버전과 PR 링크를 포함한 **Slack 공지 메시지를 클립보드에 복사**합니다:

```
VS Code Hotfix v{VERSION} 게시됨

- 수정 사항 1에 대한 설명 https://github.com/cline/cline/pull/{PR_NUMBER}
- 수정 사항 2에 대한 설명 https://github.com/cline/cline/pull/{PR_NUMBER}
```

최종 요약을 제시합니다:
- 새 버전: v{VERSION}
- 태그 푸시 여부: 예
- 포함된 커밋: (목록)
- Slack 메시지 클립보드 복사 여부: 예

사용자에게 다음 사항을 상기시킵니다:
1. https://github.com/cline/cline/actions/workflows/publish.yml 에서 `v{VERSION}` 태그를 입력하여 'publish release' GitHub Action을 수동으로 실행하십시오.
2. 핫픽스 소식을 알리기 위해 Slack 메시지를 게시하십시오.

## 중요 주의 사항 (Important Notes)

- 이 워크플로우는 릴리스 브랜치를 생성하지 않고 태그만 생성합니다.
- 릴리스 노트 커밋은 main에 먼저 반영된 후 태그로 체리픽됩니다.
- 이는 main의 히스토리를 정확하게 유지하면서 태그 기반의 핫픽스 릴리스를 가능하게 합니다.
- 체리픽 충돌이 발생하면 계속하기 전에 충돌을 해결하십시오.
