// =============================
// 1) 1920×1080 캔버스를 화면에 맞게 스케일
// =============================
function fitLayoutToWindow() {
  const designW = 1920;
  const designH = 1080;
  const layout = document.getElementById("layout");
  const wrapW = window.innerWidth;
  const wrapH = window.innerHeight;

  const scale = Math.min(wrapW / designW, wrapH / designH, 1);

  const scaledW = designW * scale;
  const scaledH = designH * scale;
  const offsetX = (wrapW - scaledW) / 2;
  const offsetY = (wrapH - scaledH) / 2;

  layout.style.transform = `scale(${scale})`;
  layout.style.left = `${offsetX}px`;
  layout.style.top = `${offsetY}px`;
}

// =============================
// 2) 시소/컨텐츠 인터랙션
// =============================
document.addEventListener("DOMContentLoaded", () => {
  fitLayoutToWindow();
  window.addEventListener("resize", fitLayoutToWindow);

  // ✅ 뒤로가기 버튼: 인트로 페이지로 이동
  const BACK_URL = "https://shgmlwl.github.io/seesaw_intro_p/";
  const backBtn = document.getElementById("back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = BACK_URL;
    });
  }

  const bar = document.getElementById("re_l"); // 시소 막대
  const card = document.getElementById("re"); // 카드 박스
  const logoImg = document.getElementById("project-logo"); // 로고 이미지
  const keywordBox = document.getElementById("keyword-container");
  const companyKeys = document.querySelectorAll(".company-key");

  // balance / unbalance 텍스트
  const textWrap = document.getElementById("text");
  const textUn = textWrap.querySelector(".un-part");
  const textBal = textWrap.querySelector(".bal-part");
  let balanceState = "balance";

  const section = document.getElementById("yg_section");
  const sectionTitleEl = section.querySelector("h2");
  const sectionDetailEl = section.querySelector(".section_detail");

  // 🔹 지금 어떤 회사 컨텐츠가 열려 있는지 저장 (토글용)
  let openCompany = null;

  // ✅ 비주류 경제학 유튜브 링크 (토스 섹션 h3에서만 사용)
  const BIJU_YT_URL =
    "https://www.youtube.com/playlist?list=PLbG_OH_pU3mrLB3PiJ9c8DRexHgf8NlmK";

  /* ----------------- 회사별 키워드 데이터 (시소 무게감) ----------------- */
  const companyKeywords = {
    tbwa: {
      bias: -0.8,
      left: ["건축 전공", "포트폴리오 없음", "지원"],
      right: ["실기 과제", "촉각", "설득", "전환"],
    },

    yg: {
      bias: -0.6,
      left: [
        "첫 사회생활",
        "마음고생",
        "포지션",
        "서류전형",
        "컨펌",
        "성장",
        "서러움",
        "빅뱅",
      ],
      right: [
        "4년차 경력",
        "팬들의 반응",
        "경험치",
        "바비 솔로 프로젝트",
        "블랙핑크 데뷔 프로젝트",
        "바비 솔로 프로젝트",
      ],
    },

    first: {
      bias: -0.2,
      left: [
        "현장",
        "클라이언트",
        "공간 브랜딩 에이전시",
        "공간 UX",
        "네이밍",
        "로고 디자인",
      ],
      right: [
        "에이전시",
        "프로젝트",
        "현대카드로 이직",
        "여러 프로젝트",
        "정적인 브랜드",
      ],
    },

    hyundai: {
      bias: 0.1,
      left: [
        "규칙",
        "매뉴얼",
        "미니멀한 디자인",
        "경영진의 방향성",
        "예전 현대카드 시절 작업들",
      ],
      right: ["브랜딩", "공간 경험", "그래픽 중심의 젊은 감성", "전환"],
    },

    toss: {
      bias: 0.4,
      left: [
        "속도",
        "실험",
        "10대 타겟",
        "10대의 취향",
        "티저",
        "자산",
        "USS",
        "커뮤니티",
      ],
      right: [
        "회의실 공간",
        "스튜디오",
        "카메라 각도",
        "시즌 3",
        "구독자",
        "엔딩 신 연출",
      ],
    },
  };

  /* ----------------- 회사별 로고 ----------------- */
  const companyLogos = {
    tbwa: { src: "Img/tbwa_logo.png", alt: "TBWA Korea" },
    yg: { src: "Img/yg_logo.png", alt: "YG Entertainment 로고" },
    first: {
      src: "Img/thefirst_4.png",
      alt: "The First Penguin 로고/대표 이미지",
    },
    hyundai: { src: "Img/hyundai_1.png", alt: "현대카드 그래픽 대표 이미지" },
    toss: { src: "Img/toss_1.png", alt: "Toss Youth Card 로고" },
  };

  /* ----------------- 회사별 오른쪽 컨텐츠 ----------------- */
  const companyContent = {
    tbwa: {
      title: "TBWA 인턴 경험",
      projects: [
        {
          img: "",
          text:
            "건축 전공으로 그래픽 포트폴리오가 전혀 없는 상태에서 TBWA 코리아의 대학생 인턴십 프로그램(주니어 보드)에 지원했다." +
            "실기 과제는 ‘세상에서 가장 나쁜 그림 그리기’였고, 그림 실력으로 승부하기 어렵다고 판단했다." +
            "대신 촉각적으로 불쾌한 그림이라는 컨셉을 설정해, 종이에 일부러 거친 질감을 만들고 손에 닿았을 때 불쾌한 느낌이 들도록 작업했다." +
            "시각적 완성도보다는 개념과 접근 방식으로 설득하려는 선택이었다." +
            "이 경험을 통해, 잘 그리는 것보다 ‘어떻게 설득하느냐’가 디자인의 핵심일 수 있다는 감각을 처음으로 체감했다." +
            "이후 시각디자인에 대한 흥미가 생겼고, 전공 전환을 진지하게 고민하게 되었다.",
        },
      ],
    },

    yg: {
      title: "YG 엔터테인먼트",
      projects: [
        {
          img: "Img/ikon.png",
          heading: "1. 아이콘(iKON) 데뷔 티저",
          text:
            "YG 입사 후 처음 맡은 프로젝트로, 아티스트 데뷔를 알리는 티저 그래픽 작업을 담당했다. " +
            "이 과정에서 디자이너의 의도와 컨펌자의 의도, 그리고 대중 반응이 다를 수 있음을 체감했으며, " +
            "실무 환경의 긴장감과 책임감을 처음으로 경험한 프로젝트였다.",
        },
        {
          img: "Img/blackpink_1.png",
          heading: "2. 블랙핑크 데뷔 프로젝트",
          text:
            "블랙핑크 데뷔를 위한 메인 비주얼, 티저 이미지, 프로모션용 그래픽 디자인을 담당했다. " +
            "내부 콘셉트가 반복적으로 변경되면서 시행착오를 겪었고, 팬 반응과 대중의 시선이 디자인 성과에 " +
            "직접적으로 영향을 준다는 점을 강하게 체감했다.",
        },
        {
          img: "Img/Gd.png",
          heading: "3. 빅뱅 ‘MADE’ 앨범 커버",
          text:
            "지드래곤의 스케치처럼 단순한 원본 이미지 위에 타이포그래피, 텍스처, 레이어를 겹겹이 쌓아 완성한 앨범 커버 디자인이다. " +
            "이 프로젝트를 통해 그는 ‘레이어들이 쌓이며 최종 결과의 힘이 만들어진다’는 자신의 디자인 철학을 정립하게 된다.",
          more:
            "신입 디자이너로 입사해, 첫 프로젝트부터 아이콘, 블랙핑크, 빅뱅 등 대형 아티스트의 작업을 경험했다." +
            "실제 실무에서는 ‘내 생각’과 ‘컨펌자의 생각’이 완전히 다를 수 있다는 현실을 강하게 체감했다." +
            "신입으로서의 서러움, 불안정함을 겪었지만, 동시에 대규모 프로젝트의 구조와 협업 방식을 몸으로 익혔다." +
            "블랙핑크 데뷔 프로젝트에서는 내부 컨셉이 계속 바뀌며 시행착오가 반복되었고, 팬 반응이 좋지 않아 심리적 부담도 컸다." +
            "바비 솔로 프로젝트처럼, 작업을 모두 준비했지만 발매 일정이 미뤄져 결과물이 세상에 나오지 못한 경험도 있었다." +
            "이 시기의 경험은 이후 인하우스 디자이너로서 조율과 현실 감각을 갖추는 데 중요한 기반이 되었다.",
        },
        {},
      ],
    },

    first: {
      title: "더퍼스트펭귄",
      projects: [
        {
          img: "Img/thefirst_2.png",
          heading: "1. 더퍼스트펭귄 공간 브랜딩 프로젝트 – 에이전시",
          text:
            "YG 이후 이직한 공간·브랜딩 에이전시인 더퍼스트펭귄에서 공간 UX, 브랜드 아이덴티티, 네이밍, 로고, " +
            "브랜드 시스템 디자인을 경험했다. 이 시기를 통해 ‘정적인 브랜딩과 공간 기반 설계’에 대한 실무 역량을 축적했고, " +
            "이후 현대카드 이직의 기반이 되는 포트폴리오를 완성했다.",
          more:
            "엔터테인먼트 중심의 그래픽 작업에서 벗어나, 공간 브랜딩 에이전시로 이동했다." +
            "공간 UX, 네이밍, 로고, 정적인 브랜드 시스템 등 그래픽을 넘어선 브랜드 설계 경험을 쌓았다." +
            "이 시기에 쌓은 작업들이 이후 현대카드로 이직하는 데 결정적인 포트폴리오가 되었다." +
            "건축 전공 경험이 이 단계에서 자연스럽게 다시 연결되었다.",
        },
      ],
    },

    hyundai: {
      title: "현대카드",
      projects: [
        {
          img: "Img/hyundai_2.png",
          heading: "1. 디지털러버 프로젝트",
          text:
            "현대카드에서는 미니멀한 디자인을 기대했지만 입사 직후 경영진의 방향성이 바뀌며 ‘그래픽 중심의 젊은 감성’으로 전환되는 과정을 겪었다. " +
            "이 시기에 진행한 〈Digital Lover〉 프로젝트는 사이파이적 세계관을 기반으로 한 그래픽·타이포그래피·에디토리얼 콘텐츠를 통합한 작업으로, " +
            "디지털 포맷에서 확장 가능한 비주얼 시스템 구축을 시도한 대표 사례였다. " +
            "프로젝트 전환 과정에서 필요한 그래픽 톤과 시스템 설계, 디지털 경험 중심의 표현 방식을 실무적으로 축적하게 된다.",
          more:
            "입사 당시에는 미니멀하고 정제된 그래픽 환경을 기대했지만, 경영진의 방향성이 바뀌며 그래픽 중심의 젊은 감성으로 전환되는 시기를 겪었다." +
            "변화의 과정에서 실험적인 시도들이 많았고, 디지털 환경에 맞춘 그래픽 경험을 폭넓게 쌓을 수 있었다." +
            "조직의 방향이 바뀌는 상황에서, 디자이너가 어떻게 적응하고 역할을 재정의해야 하는지 고민하게 된 시기였다.",
        },
      ],
    },

    toss: {
      title: "토스",
      projects: [
        {
          img: "Img/tossY_4.png",
          heading: "1. 토스 유스 카드(Toss Youth Card)",
          text:
            "10대를 타깃으로 한 카드 브랜딩 프로젝트로, 10대의 음악·밈·콘텐츠·커뮤니티 문화를 직접 조사해 " +
            "‘USS’라는 커뮤니티형 네이밍과 세계관을 구축했다. 카드 디자인, 3D 모션, 티저 영상, 출시 캠페인까지 확장 기획했으며, " +
            "누적 160만 장 이상 발급된 대표 성공 사례가 되었다.",
          more:
            "현대카드 출신이라는 이유로 카드 프로젝트를 맡게 되었고, 10대 타겟 카드 디자인이라는 과제가 주어졌다." +
            "당시 30대였던 본인이 10대의 취향을 추측만으로 만들 수 없다는 한계를 명확히 인식했다." +
            "트렌드 리포트보다 실제 10대들의 콘텐츠(유튜브, 틱톡, 밈, 동네 문화)를 직접 조사했다." +
            "10대를 하나의 취향으로 규정할 수 없다는 점이 핵심 인사이트였다." +
            "하나의 스타일로 통일하기보다, 다양한 정체성이 공존할 수 있는 구조를 선택했다." +
            "‘Youth’를 그대로 쓰지 않고 ‘USS’라는 네이밍으로 변형해 집단 정체성을 강조했다." +
            "결과적으로 160만 장 이상 발급되며 강력한 브랜드 자산이 되었다.",
        },
        {
          img: "Img/tossB_6.png",
          heading: "2. 〈비주류 경제학〉",
          text:
            "원래는 로고 디자인 의뢰로 시작된 프로젝트였지만, 로고 모션, 영상 OAP, 자막 서체, 굿즈, 세트 디자인, " +
            "팝업 행사까지 전체 아트 디렉션으로 확장 제안한 프로젝트다. 건축 전공 경험을 살려 실제 공간을 스튜디오처럼 설계했고, " +
            "프로그램은 시즌 3까지 이어지며 채널 구독자 약 45만 명 규모로 성장했다.",
          more:
            "최초 요청은 “워드마크 로고 하나”였다." +
            "콘텐츠를 살펴본 뒤, 단순한 로고로 끝내기엔 잠재력이 크다고 판단했다." +
            "로고 모션·인트로 영상·OAP·자막 시스템·굿즈·세트 디자인까지 전체 아트 디렉션을 제안했다." +
            "건축 전공 경험을 살려 회의실 공간 기반의 저비용 고효율 세트를 설계했다." +
            "3D 모델링으로 카메라 앵글까지 사전에 설계해 촬영 공간과 연결했다." +
            "시즌 3까지 이어졌고 구독자도 크게 성장했다." +
            "“시키지 않은 것을 잘 해냈을 때 발생하는 가치”를 직접 체감했다.",
        },
      ],
    },
  };

  /* =========================================================
     (핵심) 토스 섹션 "비주류 경제학" h3에만: 깜빡임 + 링크
  ========================================================= */
  function attachBijuFX(h3) {
    h3.style.cursor = "pointer";
    h3.style.textDecoration = "underline";
    h3.style.textUnderlineOffset = "7px";
    h3.style.textDecorationThickness = "3px";
    h3.style.textDecorationColor = "#3a3a3a";

    const blinkTween = gsap.fromTo(
      h3,
      { color: "#3a3a3a" },
      {
        color: "#111",
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        onUpdate: () => {
          h3.style.textDecorationColor = getComputedStyle(h3).color;
        },
      }
    );

    h3.addEventListener("mouseenter", () => {
      blinkTween.pause();
      gsap.set(h3, { color: "#111" });
      h3.style.textDecorationColor = "#111";
    });

    h3.addEventListener("mouseleave", () => {
      blinkTween.resume();
    });

    h3.addEventListener("click", () => {
      window.open(BIJU_YT_URL, "_blank", "noopener,noreferrer");
    });
  }

  /* ----------------- 오른쪽 컨텐츠 렌더 ----------------- */
  function renderCompanyContent(company) {
    section.classList.remove("is-tbwa");
    if (company === "tbwa") section.classList.add("is-tbwa");

    const data = companyContent[company];
    if (!data) return;

    // ✅✅ (추가) 회사 바뀌면 스크롤을 무조건 맨 위로
    sectionDetailEl.scrollTop = 0;
    sectionDetailEl.scrollLeft = 0;

    sectionTitleEl.textContent = data.title;
    gsap.fromTo(
      sectionTitleEl,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );

    sectionDetailEl.innerHTML = "";
    const tl = gsap.timeline({ delay: 0.15 });

    data.projects.forEach((proj, index) => {
      if (!proj || (!proj.text && !proj.heading && !proj.img && !proj.more))
        return;

      // 이미지
      let img = null;
      if (proj.img && String(proj.img).trim() !== "") {
        img = document.createElement("img");
        img.src = proj.img;
        img.alt = proj.heading || "";
        sectionDetailEl.appendChild(img);
      }

      // 제목
      const h3 = document.createElement("h3");
      h3.textContent = proj.heading || "";

      // 토스 "비주류 경제학"만 FX
      if (company === "toss" && /비주류\s*경제학/.test(proj.heading || "")) {
        attachBijuFX(h3);
      }

      // 본문
      const p = document.createElement("p");
      p.innerHTML = (proj.text || "").replace(/\n/g, "<br>");

      sectionDetailEl.appendChild(h3);
      sectionDetailEl.appendChild(p);

      // more
      let moreEl = null;
      if (proj.more && String(proj.more).trim() !== "") {
        moreEl = document.createElement("p");
        moreEl.className = "proj-more";
        moreEl.innerHTML = String(proj.more).replace(/\n/g, "<br>");
        sectionDetailEl.appendChild(moreEl);
      }

      // 애니메이션 대상
      const nodes = [];
      if (img) nodes.push(img);
      nodes.push(h3, p);
      if (moreEl) nodes.push(moreEl);

      gsap.set(nodes, { opacity: 0, y: 30 });

      tl.to(
        nodes,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
        },
        index === 0 ? 0 : ">-0.1"
      );
    });

    // ✅✅ (추가) 이미지 로딩/레이아웃 변동 대비: 다음 프레임에 한 번 더 위로 고정
    requestAnimationFrame(() => {
      sectionDetailEl.scrollTop = 0;
      sectionDetailEl.scrollLeft = 0;
    });
  }

  /* ----------------- 로고 카드 애니메이션 ----------------- */
  function punchLogoDrop() {
    gsap.killTweensOf(card);
    gsap.killTweensOf(bar);

    const tl = gsap.timeline();

    tl.set(card, {
      yPercent: -14,
      scale: 0.96,
      rotation: -4,
      x: 0,
      transformOrigin: "50% 50%",
    })
      .to(card, {
        yPercent: 4,
        scale: 1.02,
        rotation: -1,
        duration: 0.45,
        ease: "power2.out",
      })
      .to(
        card,
        {
          yPercent: 0,
          scale: 1,
          rotation: 0,
          duration: 0.4,
          ease: "power3.out",
        },
        ">-0.1"
      );

    gsap.fromTo(
      bar,
      { rotation: -2 },
      { rotation: 0, duration: 0.55, ease: "power2.out" }
    );
  }

  /* ----------------- balance / unbalance 텍스트 상태 ----------------- */
  let currentCompany = "yg";
  let diff = 0;
  let targetAngle = 0;
  let leftCount = 0;
  let rightCount = 0;

  const MAX_CHIPS = 14;
  let activeChips = 0;
  let keywordsRunning = false;

  gsap.set(bar, { rotation: 0, transformOrigin: "50% 50%" });
  gsap.set(card, {
    rotation: 0,
    yPercent: 0,
    x: 0,
    transformOrigin: "50% 50%",
  });

  function updateBalanceText() {
    const tilt = Math.abs(diff);
    const newState = tilt >= 3 ? "unbalance" : "balance";
    if (newState === balanceState) return;
    balanceState = newState;

    if (newState === "unbalance") {
      const tl = gsap.timeline();
      tl.set(textWrap, { opacity: 1 })
        .fromTo(
          textUn,
          { opacity: 0, x: -20, y: -20 },
          { opacity: 1, x: -8, y: -10, duration: 0.35, ease: "power2.out" }
        )
        .to(textBal, { x: 4, y: 6, duration: 0.35, ease: "power2.out" }, "<");
    } else {
      const tl = gsap.timeline();
      tl.to(textUn, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
      }).to(textBal, { x: 0, y: 0, duration: 0.3, ease: "power2.in" }, "<");
    }
  }

  function applyAngle() {
    const slideX = diff * 8;

    gsap.to(bar, { rotation: targetAngle, duration: 0.7, ease: "power2.out" });

    gsap.to(card, {
      rotation: targetAngle - 3,
      yPercent: 6 + Math.abs(targetAngle) * 0.2,
      x: slideX,
      duration: 0.7,
      ease: "power2.out",
    });

    updateBalanceText();
  }

  function nudgeSeesaw(side, sign = 1) {
    diff += (side === "left" ? -1 : 1) * sign;
    diff = gsap.utils.clamp(-5, 5, diff);
    targetAngle = diff * 3.5;
    applyAngle();
  }

  /* ----------------- 키워드 칩 생성/애니메이션 ----------------- */
  function createChip(text, side) {
    const chip = document.createElement("span");
    chip.classList.add("keyword-chip");
    chip.textContent = text;

    const boxWidth = bar.clientWidth || 520;
    const minX = side === "left" ? 0.05 * boxWidth : 0.74 * boxWidth;
    const maxX = side === "left" ? 0.26 * boxWidth : 0.95 * boxWidth;
    const startX = gsap.utils.random(minX, maxX);

    chip.style.left = `${startX}px`;
    chip.style.top = "0px";
    chip.dataset.startX = String(startX);

    keywordBox.appendChild(chip);
    activeChips++;
    return chip;
  }

  function animateChip(chip, side) {
    const count = side === "left" ? leftCount++ : rightCount++;
    const layer = count % 3;
    const baseY = -10;
    const targetY = baseY - layer * 14;

    const startX = parseFloat(chip.dataset.startX || "0");
    const boxWidth = bar.clientWidth || 520;
    const chipWidth = chip.offsetWidth || 40;
    const edgeX = side === "left" ? 0 : boxWidth - chipWidth;
    const slideDistance = edgeX - startX;

    const willFall = Math.random() < 0.45;

    gsap.fromTo(
      chip,
      {
        y: -110,
        opacity: 0,
        rotation: gsap.utils.random(-18, 18),
        scale: gsap.utils.random(0.9, 1.05),
      },
      {
        y: targetY,
        opacity: 1,
        rotation: gsap.utils.random(-6, 6),
        duration: gsap.utils.random(0.8, 1.1),
        ease: "power2.out",
        onComplete: () => {
          nudgeSeesaw(side, +1);

          if (!willFall) {
            gsap.to(chip, {
              x: side === "left" ? "-=8" : "+=8",
              duration: 1.0,
              ease: "power1.out",
            });

            gsap.to(chip, {
              opacity: 0,
              duration: 1.2,
              delay: gsap.utils.random(6, 9),
              ease: "power1.out",
              onStart: () => nudgeSeesaw(side, -1),
              onComplete: () => {
                chip.remove();
                activeChips = Math.max(0, activeChips - 1);
              },
            });
          } else {
            gsap.to(chip, {
              x: slideDistance,
              duration: gsap.utils.random(0.9, 1.4),
              ease: "power1.inOut",
              onComplete: () => {
                gsap.to(chip, {
                  y: targetY + 60,
                  opacity: 0,
                  duration: 0.7,
                  ease: "power2.in",
                  onStart: () => nudgeSeesaw(side, -1),
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

  function spawnOneKeyword() {
    if (!keywordsRunning) return;

    const data = companyKeywords[currentCompany];
    if (!data) return;

    if (activeChips >= MAX_CHIPS) {
      gsap.delayedCall(gsap.utils.random(0.8, 1.4), spawnOneKeyword);
      return;
    }

    const bias = data.bias || 0;
    let pRight = 0.5 + bias * 0.2;
    pRight = gsap.utils.clamp(0.2, 0.8, pRight);

    const side = Math.random() < pRight ? "right" : "left";
    const words = data[side];
    const text = words[Math.floor(Math.random() * words.length)];

    const chip = createChip(text, side);
    animateChip(chip, side);

    gsap.delayedCall(gsap.utils.random(0.7, 1.5), spawnOneKeyword);
  }

  /* ----------------- 시소/텍스트 리셋 ----------------- */
  function resetSeesawVisual({ instant = false } = {}) {
    gsap.killTweensOf([bar, card, textUn, textBal]);

    diff = 0;
    targetAngle = 0;
    leftCount = 0;
    rightCount = 0;
    activeChips = 0;

    if (instant) {
      gsap.set(bar, { rotation: 0 });
      gsap.set(card, { rotation: 0, x: 0, yPercent: 0 });
    } else {
      gsap.to(bar, { rotation: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(card, {
        rotation: 0,
        x: 0,
        yPercent: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    gsap.set(textWrap, { opacity: 0 });
    balanceState = "balance";
  }

  // ✅ 지금 열려있는 회사만 검정 고정(깜빡임 멈춤)
  function setActiveKey(companyOrNull) {
    companyKeys.forEach((k) => k.classList.remove("is-active"));
    if (!companyOrNull) return;

    const active = document.querySelector(
      `.company-key[data-company="${companyOrNull}"]`
    );
    if (active) active.classList.add("is-active");
  }

  /* ----------------- 회사 전환 ----------------- */
  function setCompany(company) {
    if (!companyKeywords[company]) return;
    currentCompany = company;

    // 같은 회사 다시 클릭 → 초기 상태로
    if (openCompany === company) {
      openCompany = null;

      sectionTitleEl.textContent = "";
      sectionDetailEl.innerHTML = "";

      keywordsRunning = false;
      keywordBox.innerHTML = "";

      logoImg.style.display = "none";
      setActiveKey(null);

      resetSeesawVisual({ instant: true });
      return;
    }

    openCompany = company;

    keywordsRunning = true;
    keywordBox.innerHTML = "";
    resetSeesawVisual({ instant: true });

    punchLogoDrop();

    balanceState = "unbalance";
    updateBalanceText();

    const logo = companyLogos[company];
    if (logo) {
      logoImg.src = logo.src;
      logoImg.alt = logo.alt;
      logoImg.style.display = "block";
    } else {
      logoImg.style.display = "none";
    }

    renderCompanyContent(company);

    // ✅✅ (추가) setCompany에서도 한 번 더 강제 (안정빵)
    sectionDetailEl.scrollTop = 0;
    sectionDetailEl.scrollLeft = 0;
    requestAnimationFrame(() => {
      sectionDetailEl.scrollTop = 0;
      sectionDetailEl.scrollLeft = 0;
    });

    // ✅ 클릭한 회사 키만 검정 고정
    setActiveKey(company);

    spawnOneKeyword();
  }

  companyKeys.forEach((el) => {
    el.addEventListener("click", () => setCompany(el.dataset.company));
  });

  /* ----------------- 초기 상태 ----------------- */
  sectionTitleEl.textContent = "";
  sectionDetailEl.innerHTML = "";

  gsap.set(textWrap, { opacity: 0 });
  logoImg.style.display = "none";
  keywordsRunning = false;
  keywordBox.innerHTML = "";
  setActiveKey(null);
  resetSeesawVisual({ instant: true });
});
