document.addEventListener("DOMContentLoaded", () => {
  const bar = document.getElementById("re_l"); // 시소 막대
  const card = document.getElementById("re"); // 카드
  const keywordBox = document.getElementById("keyword-container");
  const companyKeys = document.querySelectorAll(".company-key");

  /* ----------------- 회사별 키워드 데이터 -----------------
     left  : 힘든 감정/부담
     right : 그래도 견딜 만한/성장
  ------------------------------------------------------ */
  const companyKeywords = {
    yg: {
      bias: -0.6,
      left: ["야근", "긴장감", "데뷔 압박"],
      right: ["성장", "데뷔 프로젝트", "경험치"],
    },
    hyundai: {
      bias: 0.1,
      left: ["규칙", "매뉴얼"],
      right: ["브랜딩", "공간 경험"],
    },
    toss: {
      bias: 0.4,
      left: ["속도", "실험"],
      right: ["자율", "기회"],
    },
    first: {
      bias: -0.2,
      left: ["현장", "클라이언트"],
      right: ["에이전시", "프로젝트"],
    },
  };

  let currentCompany = "yg";

  /* ----------------- 시소 각도 & 스택 상태 ----------------- */
  let diff = 0; // 오른쪽 - 왼쪽 “무게 차이”
  let targetAngle = 0; // 실제 회전 각도
  let leftCount = 0; // 왼쪽에 쌓인 개수
  let rightCount = 0; // 오른쪽에 쌓인 개수

  /* ⭐ 동시에 화면에 존재하는 최대 키워드 수 제한 */
  const MAX_CHIPS = 10;
  let activeChips = 0;

  // 처음: 막대, 카드 모두 수평
  gsap.set(bar, { rotation: 0, transformOrigin: "50% 50%" });
  gsap.set(card, { rotation: 0, yPercent: 0, transformOrigin: "50% 50%" });

  function applyAngle() {
    gsap.to(bar, {
      rotation: targetAngle,
      duration: 0.7,
      ease: "power2.out",
    });

    // 카드도 막대와 거의 같은 각도 + 살짝 더 기운 느낌
    gsap.to(card, {
      rotation: targetAngle - 2,
      yPercent: 4 + Math.abs(targetAngle) * 0.15,
      duration: 0.7,
      ease: "power2.out",
    });
  }

  function nudgeSeesaw(side, sign = 1) {
    // sign: 올라올 때 +1, 떨어질 때 -1 로 되돌릴 수 있게
    diff += (side === "left" ? -1 : 1) * sign;
    diff = gsap.utils.clamp(-4, 4, diff); // 과한 기울기 방지

    targetAngle = diff * 3; // 최대 -12 ~ 12도
    applyAngle();
  }

  /* ----------------- 키워드 span 만들기 ----------------- */
  function createChip(text, side) {
    const chip = document.createElement("span");
    chip.classList.add("keyword-chip");
    chip.textContent = text;

    const boxWidth = bar.clientWidth || 520;

    // 카드 영역은 비우고, 막대 좌/우만 사용
    // 왼쪽: 5~26%, 오른쪽: 74~95% (막대 폭 기준)
    const minX = side === "left" ? 0.05 * boxWidth : 0.74 * boxWidth;
    const maxX = side === "left" ? 0.26 * boxWidth : 0.95 * boxWidth;
    const startX = gsap.utils.random(minX, maxX);

    chip.style.position = "absolute";
    chip.style.left = `${startX}px`;
    chip.style.top = "0px"; // y는 GSAP로 제어

    // 나중에 슬라이드 거리 계산을 위해 저장
    chip.dataset.startX = String(startX);

    keywordBox.appendChild(chip);

    // ⭐ 새 칩이 생길 때 개수 증가
    activeChips++;

    return chip;
  }

  /* ----------------- 키워드 떨어지는 + (일부만) 막대 끝에서 떨어져 나가는 애니메이션 ----------------- */
  function animateChip(chip, side) {
    // 같은 사이드에 최대 3층까지만 위로 쌓이게
    const count = side === "left" ? leftCount++ : rightCount++;
    const layer = count % 3; // 0, 1, 2 반복
    const baseY = -8; // 막대 바로 위
    const targetY = baseY - layer * 10; // -8,-18,-28 정도

    const startX = parseFloat(chip.dataset.startX || "0");
    const boxWidth = bar.clientWidth || 520;
    const chipWidth = chip.offsetWidth || 40;

    // 막대의 실제 끝(칩 크기 고려)
    const edgeX =
      side === "left"
        ? 0 // 왼쪽 끝 (필요하면 5~10 정도로 안쪽 조정 가능)
        : boxWidth - chipWidth; // 오른쪽 끝

    const slideDistance = edgeX - startX; // transform x 로 움직일 거리

    // ⭐ 일부만 진짜로 끝까지 가서 떨어지게 (30% 정도)
    const willFall = Math.random() < 0.3;

    gsap.fromTo(
      chip,
      {
        y: -60,
        opacity: 0,
        rotation: gsap.utils.random(-10, 10),
      },
      {
        y: targetY,
        opacity: 1,
        rotation: gsap.utils.random(-5, 5),
        duration: gsap.utils.random(0.9, 1.2),
        ease: "power2.out",
        onComplete: () => {
          // 막대 위에 안착 → 시소 기울이기
          nudgeSeesaw(side, +1);

          if (!willFall) {
            // ✅ 대부분 칩: 살짝만 미끄러지고 막대 위에 계속 남아있게
            gsap.to(chip, {
              x: side === "left" ? "-=6" : "+=6",
              duration: 1.0,
              ease: "power1.out",
            });

            // 너무 오래 쌓이지 않게, 느리게 희미해지며 사라지도록 (무게도 제거)
            const fadeDelay = gsap.utils.random(6, 9);
            gsap.to(chip, {
              opacity: 0,
              duration: 1.2,
              delay: fadeDelay,
              ease: "power1.out",
              onStart: () => {
                nudgeSeesaw(side, -1); // 무게 제거
              },
              onComplete: () => {
                chip.remove();
                activeChips = Math.max(0, activeChips - 1);
              },
            });
          } else {
            // ✅ 일부 칩만: 끝까지 미끄러져서 조금 떨어진 뒤 사라짐
            gsap.to(chip, {
              x: slideDistance,
              duration: gsap.utils.random(1.0, 1.6),
              ease: "power1.inOut",
              onComplete: () => {
                gsap.to(chip, {
                  y: targetY + 40, // 살짝만 떨어지게 (80 → 40으로 줄임)
                  opacity: 0,
                  duration: 0.7,
                  ease: "power2.in",
                  onStart: () => {
                    nudgeSeesaw(side, -1); // 떨어질 때 무게 제거
                  },
                  onComplete: () => {
                    chip.remove();
                    activeChips = Math.max(0, activeChips - 1);
                  },
                });
              },
            });
          }
        },
      }
    );
  }

  /* ----------------- 키워드 계속 쏟아지게 하는 루프 ----------------- */
  function spawnOneKeyword() {
    const data = companyKeywords[currentCompany];
    if (!data) return;

    // ⭐ 너무 많이 쌓였으면 새로 안 만들고 조금 있다가 다시 시도
    if (activeChips >= MAX_CHIPS) {
      const coolDown = gsap.utils.random(0.8, 1.6);
      gsap.delayedCall(coolDown, spawnOneKeyword);
      return;
    }

    const bias = data.bias || 0;

    // bias 에 따라 어느 쪽이 더 자주 떨어질지, 그래도 양쪽 다 나오게
    let pRight = 0.5 + bias * 0.2;
    pRight = gsap.utils.clamp(0.2, 0.8, pRight);

    const side = Math.random() < pRight ? "right" : "left";
    const words = data[side];
    const text = words[Math.floor(Math.random() * words.length)];

    const chip = createChip(text, side);
    animateChip(chip, side);

    // 다음 키워드는 랜덤 간격으로 계속 (조금 느리게)
    const nextDelay = gsap.utils.random(1.1, 2.2);
    gsap.delayedCall(nextDelay, spawnOneKeyword);
  }

  /* ----------------- 회사 선택/변경 ----------------- */
  function setCompany(company) {
    if (!companyKeywords[company]) return;
    currentCompany = company;

    // 기존 키워드 제거 + 스택/각도 리셋
    keywordBox.innerHTML = "";
    diff = 0;
    targetAngle = 0;
    leftCount = 0;
    rightCount = 0;
    activeChips = 0; // ⭐ 회사 바꿀 때도 리셋

    gsap.to(bar, { rotation: 0, duration: 0.5, ease: "power2.out" });
    gsap.to(card, {
      rotation: 0,
      yPercent: 0,
      duration: 0.5,
      ease: "power2.out",
    });

    // 카드 라벨 텍스트 변경
    const label = document.getElementById("project-label");
    if (company === "yg") {
      label.textContent = "YG Entertainment (2016)";
    } else if (company === "hyundai") {
      label.textContent = "Hyundai Card";
    } else if (company === "toss") {
      label.textContent = "Toss Youth Card";
    } else if (company === "first") {
      label.textContent = "The First Penguin";
    }
  }

  companyKeys.forEach((el) => {
    el.addEventListener("click", () => {
      setCompany(el.dataset.company);
    });
  });

  // 처음: YG 로 세팅 후 키워드 떨어지기 시작
  setCompany("yg");
  spawnOneKeyword();
});
