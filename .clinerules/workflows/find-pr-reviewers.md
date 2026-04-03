# 현재 브랜치에 적합한 리뷰어 찾기 (Find Best Reviewers)

현재 브랜치를 분석하여 **도메인 전문성**과 git 히스토리를 기반으로 PR 리뷰에 가장 적합한 사람을 찾습니다.

## 단계 (Steps)

1. 현재 브랜치 이름을 확인하고 `main` 브랜치가 아닌지 확인합니다.
2. 현재 브랜치와 `origin/main` 사이의 차이점(diff)을 가져옵니다:
   - `git diff origin/main...HEAD --name-only`를 사용하여 변경된 파일 목록 확인
   - `git diff origin/main...HEAD`를 사용하여 변경 사항의 성격/취지 파악
3. 변경 중인 **도메인/기능 영역을 식별**합니다:
   - diff 내용을 신중히 읽고 개념적으로 무엇이 변경되는지 파악합니다 (예: "슬래시 명령어", "인증", "API 클라이언트", "UI 컴포넌트").
   - 이러한 의미론적 이해는 적절한 리뷰어를 찾는 데 필수적입니다.
4. 관련 파일 및 해당 기여자를 검색하여 도메인 전문가를 찾습니다:
   - 해당 기능/도메인과 관련된 모든 파일(변경된 파일뿐만 아니라)을 식별합니다.
   - 예: 슬래시 명령어를 변경하는 경우, 코드베이스 전체에서 슬래시 명령어와 관련된 모든 파일을 찾습니다.
   - `git log --format="%an <%ae>" -- <관련-파일-패턴>`을 사용하여 해당 도메인에 전문성을 가진 사람을 찾습니다.
5. 추가적인 컨텍스트를 위해 다음 정보도 수집합니다:
   - 정확히 변경된 라인에 대해 `git blame -L <시작>,<끝> origin/main -- <파일-경로>` 확인
   - 관련 파일들의 최근 커밋 활동
6. 기여자의 점수를 매기고 순위를 정할 때 다음 기준을 적용합니다:
   - **가장 높은 가중치: 도메인 전문성** - 이 PR에서 건드리지 않은 파일을 포함하여, 해당 기능 영역의 파일들에 가장 많은 커밋을 한 사람
   - **중간 가중치: 직접적인 파일 전문성** - 변경되는 특정 파일들에 대한 커밋 횟수
   - **낮은 가중치: 라인 레벨 소유권** - 수정되는 정확한 라인을 작성한 사람
7. 나 자신은 제외합니다 (내 git config의 user.email과 대조 확인).
8. 상위 5명의 리뷰어를 순서대로 목록으로 제시합니다.

## 출력 형식 (Output Format)

순서가 있는 목록으로 출력합니다:

1. **이름** - 도메인 전문가: 슬래시 명령어 관련 파일에 15회 커밋, 핵심 파싱 로직 작성
2. **이름** - 영향받는 파일에 8회 커밋, 최근에 수정 중인 기능을 추가함
3. ...

## 명령어 참조 (Commands Reference)
```bash
git config user.email
git diff origin/main...HEAD --name-only
git diff origin/main...HEAD
# 도메인 관련 파일 찾기 (diff에서 배운 내용을 바탕으로 패턴 조정)
find . -type f \( -name "*slash-command*" -o -name "*SlashCommand*" \) | head -20
# 관련 파일 기여자 확인
find . -type f \( -name "*slash-command*" -o -name "*SlashCommand*" \) -print0 | xargs -0 git log --format="%an <%ae>" -- | sort | uniq -c | sort -rn
git log --format="%an <%ae>" -- <파일> | sort | uniq -c | sort -rn
git blame -L 10,20 origin/main -- <파일>
```

질문하지 마십시오. 변경 사항을 분석하고, 도메인을 식별한 후 리뷰어 목록을 출력하십시오.
