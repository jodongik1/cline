# PR 코멘트 대응 (Address PR Comments)

현재 브랜치의 PR에 달린 모든 코멘트를 검토하고 대응합니다.

## 단계 (Steps)

1. 현재 브랜치 이름을 확인하고 연관된 PR을 찾습니다:
   ```bash
   gh pr view --json number,title,body
   ```

2. PR의 컨텍스트를 파악합니다:
   - 전체 차이점(diff) 확인: `git diff origin/main...HEAD`
   - 변경된 파일들을 읽어 PR의 작업을 이해합니다.
   - 필요한 경우 관련 파일들을 읽어 더 넓은 맥락을 파악합니다.
   - 단순한 코드 변경만이 아닌, 변경의 의도와 취지를 이해합니다.

3. 모든 PR 코멘트를 가져옵니다:
   - 인라인 코멘트: `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments`
   - 일반 코멘트: `gh pr view {pr_number} --json comments,reviews`

4. 모든 코멘트의 요약과 각 코멘트에 대한 권장 사항(적용, 건너뛰기, 또는 응답)을 제시합니다. 봇의 노이즈(릴리스 자동화, CI 상태 등)는 무시합니다.

5. 진행하기 전에 **사용자의 승인을 기다립니다.**

6. 승인 후:
   - 코드 변경 사항을 적용하고 커밋합니다.
   - 대응 완료되었거나 의도적으로 건너뛴 코멘트에 답글을 답니다.
   - 커밋을 푸시(push)합니다.
