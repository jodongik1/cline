# Git 차이점 분석 워크플로우 (Git Diff Analysis Workflow)

## 목표 (Objective)
개발 의사결정에 필요한 정보를 제공하고 맥락을 파악하기 위해, 현재 브랜치의 변경 사항을 main 브랜치와 대조하여 분석합니다.

## 1단계: Git 정보 수집 (Gather Git Information)
<important>이 명령들을 실행하는 데 필요한 텍스트나 대화 외에는 어떤 것도 반환하지 마십시오.</important>

**최신 변경 사항을 가져오기 위해 다음 명령을 실행합니다 (bash):**
```bash
B=$(for c in main master origin/main origin/master; do git rev-parse --verify -q "$c" >/dev/null && echo "$c" && break; done); B=${B:-HEAD}; r(){ git branch --show-current; printf "=== STATUS ===\n"; git status --porcelain | cat; printf "=== COMMIT MESSAGES ===\n"; git log "$B"..HEAD --oneline | cat; printf "=== CHANGED FILES ===\n"; git diff "$B" --name-only | cat; printf "=== FULL DIFF ===\n"; git diff "$B" | cat; }; L=$(r | wc -l); if [ "$L" -gt 500 ]; then r > cline-git-analysis.temp && echo "::OUTPUT_FILE=cline-git-analysis.temp"; else r; fi
```

```powershell
$B=$null;foreach($c in 'main','master','origin/main','origin/master'){git rev-parse --verify -q $c *> $null;if($LASTEXITCODE -eq 0){$B=$c;break}};if(-not $B){$B='HEAD'};function r([string]$b){git rev-parse --abbrev-ref HEAD; '=== STATUS ==='; git status --porcelain | cat; '=== COMMIT MESSAGES ==='; git log "$b"..HEAD --oneline | cat; '=== CHANGED FILES ==='; git diff "$b" --name-only | cat; '=== FULL DIFF ==='; git diff "$b" | cat};$out=r $B|Out-String;$lines=($out -split "`r?`n").Count;if($lines -gt 500){$out|Set-Content -NoNewline cline-git-analysis.temp; '::OUTPUT_FILE=cline-git-analysis.temp'}else{$out}
```

## 2단계: 자동 구조화 분석 단계 (Silent, Structured Analysis Phase)
- 설명이나 나레이션 없이 모든 git 출력을 분석합니다.
- 변경 사항의 범위와 성격을 이해하기 위해 전체 diff를 읽습니다.
- 패턴, 아키텍처 수정 또는 잠재적 영향을 식별합니다.
- 관찰된 변경 사항에 대해 추가적인 맥락을 제공하는 관련 파일들을 `read_file`로 검토합니다.

## 3단계: 컨텍스트 수집 (Context Gathering)
- 설명이나 나레이션 없이 관련 코드를 분석합니다.
- 완벽한 이해를 위해 필요한 경우 관련 소스 파일들을 읽습니다.
- 변경 사항 전반에 걸친 의존성, 임포트(import) 또는 상호 참조를 확인합니다.
- 수정 사항 주변의 더 넓은 코드베이스 컨텍스트를 이해합니다.
- 이 추가 컨텍스트 수집에는 관련 백엔드 코드뿐만 아니라 관련 UI/프론트엔드 코드도 포함되어야 합니다.
- 이 단계를 완전히 완료하려면 보통 최소 몇 개에서 많으면 수십 개의 파일을 분석해야 할 수도 있습니다.
- 가용 컨텍스트 윈도우의 60% 이상을 이미 소모했다면 추가 컨텍스트 읽기를 중단해야 합니다.
- 가용 컨텍스트 윈도우의 40% 미만을 소모했다면 추가 컨텍스트 리뷰를 계속해야 합니다.

## 4단계: 사용자 상호작용 준비 (Ready for User Interaction)
**전체 분석을 완료한 후에만:**
- 포괄적인 이해를 바탕으로 사용자와 대화합니다.
- 특정 수정 사항과 그 영향에 대한 통찰력을 제공합니다.
- 확실한 경우, 잠재적인 파괴적 변경(breaking changes)이나 호환성 문제를 언급합니다.
- 전체 변경 사항 및 수집된 컨텍스트로부터 얻은 정보로 질문에 답변합니다.
- 사용자가 질문을 제공하지 않았거나 질문이 양질의 답변을 하기에 불충분한 경우, 짧은(한 문장) 확인 질문을 던집니다.
- 사용자의 요청에 적용 가능하고 관찰된 변경 사항과 관련이 있는 경우에만 권장 사항을 제안합니다.

## 핵심 규칙 (Key Rules)
- **git 조사 단계 중에는 서술이나 대화를 하지 마십시오.**
- **컨텍스트 수집 단계 중에는 서술이나 대화를 하지 마십시오.**
- **사용자와 상호작용하기 전에 모든 분석을 완료하십시오.**
- **수집된 정보를 모든 후속 질문과 통찰력에 활용하십시오.**
- **논의하기 전에 전체적인 그림을 파악하는 데 집중하십시오.**

## 선택 사항: 추가 분석 명령어 (Optional: Additional Analysis Commands)
필요한 경우 더 깊은 조사를 위해 다음을 사용합니다:

```shell
# 저자 정보를 포함한 상세 커밋 히스토리
git log main..HEAD --format="%h %s (%an)" | cat

# 변경 통계
git diff main --stat | cat

# 특정 파일 유형의 변경 사항
git diff main --name-only | grep -E '\.(ts|js|tsx|jsx|py|md)$' | cat
```
