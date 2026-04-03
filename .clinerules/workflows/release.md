# 릴리스 (Release)

`main` 브랜치에서 직접 릴리스를 준비하고 게시합니다.

## 개요 (Overview)

이 워크플로우는 다음 과정을 도와줍니다:
1. 대상 버전 선택/확인
2. 최종 사용자를 위한 `CHANGELOG.md` 항목 수동 정리
3. `package.json` 버전과 변경 이력의 일치 여부 확인
4. 릴리스 커밋 및 태그 생성 및 푸시(push)
5. 게시(publish) 워크플로우 실행
6. GitHub 릴리스 노트 업데이트 및 요약 공유

## 프로세스 (Process)

### 1) 동기화 및 버전 결정
```bash
git checkout main
git pull origin main
cat package.json | grep '"version"'
```
메인테이너와 협의하여 릴리스 버전(patch/minor/major)을 확정합니다.

### 2) 변경 이력 및 버전 정리
- 대상 버전에 대해 사람이 읽기 쉬운 형태의 릴리스 노트를 `CHANGELOG.md`에 작성합니다.
- 버전 헤더가 대괄호 형식을 사용하는지 확인합니다. 예: `## [3.66.1]`.
- `package.json`의 version 필드도 동일한 값으로 업데이트합니다.

### 3) 커밋 및 태그 생성
```bash
git add CHANGELOG.md package.json package-lock.json
git commit -m "v<version> Release Notes"
git push origin main
git tag v<version>
git push origin v<version>
```

### 4) 게시 워크플로우 실행
메인테이너에게 다음 주소에서 워크플로우를 실행하도록 안내합니다:
https://github.com/cline/cline/actions/workflows/publish.yml

릴리스 태그로 `v<version>`을 사용하도록 합니다.

### 5) GitHub 릴리스 노트 업데이트
게시가 완료된 후:
```bash
gh release view v<version> --json body --jq '.body'
gh release edit v<version> --notes "<최종 정리된 릴리스 노트>"
```

### 6) 최종 요약
다음에 대한 정보를 제공합니다:
- 릴리스된 버전/태그
- 릴리스 페이지 링크
- 주요 변경 사항 요약
