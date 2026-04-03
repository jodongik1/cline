@rem ##########################################################################
@rem
@rem  Gradle Wrapper 실행 스크립트 (Windows용)
@rem
@rem ##########################################################################

@if "%DEBUG%"=="" @echo off
@rem Windows NT 셸 환경에서 변수의 범위를 지역(local)으로 설정
if "%OS%"=="Windows_NT" setlocal

@rem 현재 스크립트가 위치한 디렉터리 경로 설정
set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem APP_HOME 경로에서 "."이나 ".."을 제거하여 절대 경로로 정리
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem 기본 JVM 옵션 설정 (메모리 제한 등)
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

@rem java.exe 실행 파일 찾기
if defined JAVA_HOME goto findJavaFromJavaHome

@rem JAVA_HOME이 정의되지 않은 경우 시스템 PATH에서 java 검색
set JAVA_EXE=java.exe
%JAVA_EXE% -version >NUL 2>&1
if %ERRORLEVEL% equ 0 goto execute

@rem Java를 찾지 못한 경우 에러 메시지 출력
echo. 1>&2
echo 에러: JAVA_HOME이 설정되어 있지 않고 시스템 PATH에서 'java'를 찾을 수 없습니다. 1>&2
echo. 1>&2
echo Java 설치 위치에 맞춰 사용자 환경 변수에서 JAVA_HOME을 설정해 주세요. 1>&2

goto fail

:findJavaFromJavaHome
@rem JAVA_HOME 경로의 따옴표 제거 및 bin/java.exe 경로 구성
set JAVA_HOME=%JAVA_HOME:"=%
set JAVA_EXE=%JAVA_HOME%/bin/java.exe

if exist "%JAVA_EXE%" goto execute

@rem JAVA_HOME이 잘못된 경로를 가리키는 경우
echo. 1>&2
echo 에러: JAVA_HOME이 잘못된 디렉터리를 가리키고 있습니다: %JAVA_HOME% 1>&2
echo. 1>&2
echo Java 설치 위치에 맞춰 사용자 환경 변수에서 JAVA_HOME을 설정해 주세요. 1>&2

goto fail

:execute
@rem 실행 인자 및 클래스패스 설정
set CLASSPATH=

@rem 실제 Gradle 실행 (gradle-wrapper.jar 호출)
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" -jar "%APP_HOME%\gradle\wrapper\gradle-wrapper.jar" %*

:end
@rem 실행 결과에 따른 종료 처리
if %ERRORLEVEL% equ 0 goto mainEnd

:fail
@rem 실패 시 종료 코드 설정
set EXIT_CODE=%ERRORLEVEL%
if %EXIT_CODE% equ 0 set EXIT_CODE=1
if not ""=="%GRADLE_EXIT_CONSOLE%" exit %EXIT_CODE%
exit /b %EXIT_CODE%

:mainEnd
@rem Windows NT 환경 변수 지역 범위 종료
if "%OS%"=="Windows_NT" endlocal

:omega
