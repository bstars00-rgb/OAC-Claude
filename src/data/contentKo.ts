// Korean translations for the mock business content. Keyed by record id.
// The data accessors merge these in when the content language is Korean.
// Proper nouns (relationship names, owners, emails) are intentionally left as-is.

interface EntityKo {
  detectedContext: string
  currentFocus: string
  opportunity: string
  summary: string
  openIssues: string[]
  risks: string[]
  recommendedAction: string
  nextBestAction: string
}

export const entityKo: Record<string, EntityKo> = {
  yeogi: {
    detectedContext: 'API 연동 / 채널 확장',
    currentFocus: 'iTANK 공식 API 문의 발송 및 공급 범위 확정(CEO 보고용)',
    opportunity:
      'iTANK를 통한 단일 API 연동으로 한국·일본·베트남 호텔 공급을 국내 최대 OTA 중 하나를 통해 동시에 유통할 수 있습니다.',
    summary:
      '여기어때는 잠재적 API 연동 및 채널 확장 기회입니다. 연동은 iTANK(기술 레이어)를 통해 이루어지며, iTANK는 리소스 배정 전 helpdesk@itank.net으로 공식 문의를 요청했습니다. 호텔 공급 범위(Chalet Korea, Taiwan HRC 연결 포함), 기술 프로세스, 상업 조건을 확인해야 합니다. 규모가 커서 확정 전 CEO 보고가 필요할 가능성이 높습니다.',
    openIssues: [
      'helpdesk@itank.net 공식 API 문의 미발송',
      '호텔 공급 범위(한국/일본/베트남, Chalet Korea·Taiwan HRC 포함) 미확정',
      '기술 연동 프로세스 미정의',
      '연동 상업 조건 미확정',
    ],
    risks: [
      '공식 문의가 한 주 더 지연되면 모멘텀이 멈춤',
      '공급 범위 확정 전에는 CEO 보고에 정확한 인벤토리 수치를 제시할 수 없음',
    ],
    recommendedAction:
      '오늘 helpdesk@itank.net으로 공식 문의를 발송하세요 — 이것이 유일한 게이팅 액션이며 iTANK·Chalet Korea·Taiwan HRC를 동시에 진전시킵니다. 병행하여 한국/일본/베트남 공급 범위를 확정해 CEO 보고에서 구체적인 인벤토리와 상업 조건을 제시하세요.',
    nextBestAction: 'helpdesk@itank.net으로 공식 API 연동 문의 발송',
  },
  itank: {
    detectedContext: '기술 파트너 / API 연결성',
    currentFocus: '공식 헬프데스크 문의 제출 및 연동 옵션·상업 모델 명확화',
    opportunity:
      'iTANK는 여기어때·Chalet Korea·Taiwan HRC를 잇는 연결 레이어로, 하나의 연동으로 여러 유통 파트너를 동시에 열 수 있습니다.',
    summary:
      'iTANK와의 커뮤니케이션이 메신저에서 공식 이메일로 전환되었습니다. iTANK는 helpdesk@itank.net으로 문의를 접수하도록 요청했습니다. 연동 옵션, 필요 서류, 기술 프로세스, 상업 모델, 예상 일정, 연결 가능 파트너 범위를 확인해야 하며, 엔지니어링 리소스는 공식 문의를 전제로 합니다.',
    openIssues: [
      'helpdesk@itank.net 공식 문의 미발송',
      '연동 옵션 및 필요 서류 미파악',
      '상업 모델·예상 일정 미정의',
      '연결 파트너 범위(Chalet Korea, Taiwan HRC 등) 미확정',
    ],
    risks: [
      '공식 프로세스 충족 전까지 엔지니어링 배정 차단',
      '불명확한 상업 모델로 예상치 못한 연동 비용 발생 가능',
    ],
    recommendedAction:
      'iTANK를 한국 연결 클러스터 전체의 차단 해제 지점으로 보고, 연동 옵션·기술 프로세스·파트너 연결 범위·상업 조건·일정을 모두 담은 하나의 구조화된 문의를 helpdesk@itank.net으로 발송한 뒤 회신을 개발·상업팀에 전달하세요.',
    nextBestAction: 'helpdesk@itank.net에 옵션·프로세스·범위·일정 요청 메일 발송',
  },
  grandhyatt: {
    detectedContext: '호텔 컨트랙팅 / 요율 협상',
    currentFocus: '7월 가용성·스위트 요율·컨트랙팅 조건 확정',
    opportunity:
      '제주 대표 럭셔리 호텔과의 다이렉트 컨트랙트로 여름 성수기 한국 인바운드와 VIP 가족 수요를 선점할 수 있습니다.',
    summary:
      '그랜드 하얏트 제주는 호텔 컨트랙팅·요율 협상 건입니다. 다이렉트 컨트랙트 가능성을 확인하고, 7월 객실 가용성과 스위트 요율을 확정하며, 가족/럭셔리 수요를 점검해야 합니다. 취소 정책, 얼롯먼트, 프로모션 조건이 미확정 상태입니다. 여름 성수기 한국 인바운드와 고가치 VIP 가족 예약에 전략적으로 유용합니다.',
    openIssues: [
      '다이렉트 컨트랙트 가능 여부 미확정',
      '7월 객실 가용성 미확인',
      '스위트 요율·넷 요율 미정',
      '취소 정책·얼롯먼트·여름 프로모션 미확정',
    ],
    risks: [
      '조건 확정 전 7월 스위트 인벤토리 소진 가능',
      '얼롯먼트 미확보 시 성수기 VIP 가족 수요 보장 불가',
    ],
    recommendedAction:
      '넷 요율, 7월 가용성, 스위트 요율, 얼롯먼트(ALM), 취소 정책, 여름 프로모션 조건을 담은 하나의 구조화된 요청을 보내세요. 가족/VIP 수요를 근거로 다이렉트 컨트랙트와 성수기 얼롯먼트 확보를 추진하세요.',
    nextBestAction: '7월 넷 요율·ALM·취소 정책·여름 프로모션 요청',
  },
  medkorea: {
    detectedContext: '기업 고객 / 넷 요율 세일즈',
    currentFocus: '넷 요율·마크업·선불 정산 모델을 명확히 설명',
    opportunity:
      '의료관광 인바운드 고객을 위한 기업 넷 요율 프로그램은 서울 클리닉 인근 장기 투숙 수요를 반복적으로 창출합니다.',
    summary:
      'Medical Korea Service(MKS)는 기업 고객으로서 협업을 검토 중입니다. 모델은 넷 요율 방식으로, 오마이호텔이 넷 요율을 공급하고 MKS가 자체 마크업을 더합니다. 넷 정산 모델을 명확히 설명해야 하며, 볼륨이 안정될 때까지 선불 구조가 필요할 수 있습니다. 보장 예약 프로세스와 호텔별 취소/변경 규정도 설명이 필요합니다.',
    openIssues: [
      '넷 요율+마크업 모델 서면 설명 미완료',
      '램프업 기간 선불 정산 구조 미합의',
      '보장 예약 프로세스에 대한 고객 이해 부족',
      '호텔별 취소·변경 규정 문서화 필요',
    ],
    risks: [
      '넷 vs 커미션 모델 오해로 거래 지연 가능',
      '볼륨 검증 전 선불 조건 부재 시 정산 리스크 상승',
    ],
    recommendedAction:
      '넷 요율 공급, 고객 측 마크업 책임, 램프업 기간 선불 정산 구조, 보장 예약 흐름, 호텔별 취소/변경 정책을 담은 구조화된 협업 조건 요약을 보내세요. 정산 명확성으로 신뢰를 먼저 구축하세요.',
    nextBestAction: '구조화된 넷 요율·선불 정산 협업 요약 발송',
  },
  supdanang: {
    detectedContext: '공급사 상품 / 운영 셋업',
    currentFocus: 'Sunrise/Sunset SUP 패들 투어 상품 시트와 운영 조건 확정',
    opportunity:
      '잘 운영되는 선라이즈/선셋 패들 투어는 성장하는 다낭 레저 시장에서 고마진 액티비티 상품입니다.',
    summary:
      'SUP 다낭은 액티비티 공급사입니다. Sunrise/Sunset SUP 패들 투어가 잠재 상품으로 선정되었습니다. 출시를 위해 최종 상품 시트, 넷 가격, 일정, 예약 마감 시간, 기상 취소 정책, 정산 방법, 고객 준비물을 확정해야 합니다.',
    openIssues: [
      '최종 상품 시트·넷 가격 미정',
      '일정·예약 마감 시간 미설정',
      '기상 취소 정책 미확정',
      '정산 방법·고객 준비물 미정의',
    ],
    risks: [
      '기상 취소 정책 모호성은 수상 액티비티의 최대 고객 경험 실패 지점',
      '마감 시간 불명확 시 막판 운영 충돌 발생',
    ],
    recommendedAction:
      '넷 가격, 일정, 예약 마감, 기상 취소 정책, 정산 방법, 고객 준비물을 묶은 최종 상품 시트를 요청하세요. 출시 전 기상 취소 정책을 먼저 확정하세요 — 핵심 출시 차단 요소입니다.',
    nextBestAction: '최종 상품 시트와 전체 운영 조건 요청',
  },
  danangsurf: {
    detectedContext: '공급사 상품 / 예약 운영',
    currentFocus: '예약 마감·결제·기상/계절 운영 규칙 확정',
    opportunity:
      '렌탈+사진 포함 서핑 레슨과 당일 무료 서핑은 다낭의 강력한 번들 액티비티 상품입니다.',
    summary:
      '다낭 홀리데이 서프는 09:00, 14:30 서핑 클래스를 제공하며, 레슨에 보드 렌탈과 사진이 포함되고 레슨 후 당일 무료 서핑이 가능합니다. 운영을 위해 예약 마감·결제 방법을 정하고, 기상 취소/환불 정책을 명확히 하며, 겨울·우기 운영 프로세스를 확정해야 합니다.',
    openIssues: [
      '예약 마감·결제 방법 미확정',
      '기상 취소·환불 정책 불명확',
      '겨울/우기 운영 프로세스 미확정',
    ],
    risks: [
      '계절(겨울/우기) 가용성 혼선으로 취소 발생 가능',
      '서면 정책 부재 시 노쇼·환불 분쟁 가능',
    ],
    recommendedAction:
      '09:00/14:30 일정을 명확한 예약 마감·결제 방법과 함께 확정한 뒤, 기상 취소/환불 정책과 겨울/우기 운영 규칙을 문서화하세요. 다낭 교차 판매를 위해 SUP 다낭과의 번들도 검토하세요.',
    nextBestAction: '마감·결제 방법 및 기상/계절 운영 규칙 확정',
  },
  goglobal: {
    detectedContext: 'SLA / API 파트너십',
    currentFocus: 'SLA 날인 절차 마무리 및 API 라이브 키 확보',
    opportunity:
      'GoGlobal은 라이브·성장 중인 API 파트너로, SLA와 라이브 키를 마무리하면 즉시 대규모 유통이 가능합니다.',
    summary:
      'GoGlobal Travel SLA 검토가 완료되었습니다. 오마이호텔은 날인 절차(법인 인감 완료 여부, 서명 잔여 여부)를 확인해야 합니다. 상업 PIC는 Aiden으로 변경되었고 공급 측 조율은 Sophia가 담당합니다. 핵심 미해결 사항은 API 라이브 키 수령 시점입니다.',
    openIssues: [
      'SLA 날인 절차 미확인(인감 완료? 서명 잔여?)',
      'API 라이브 키 미수령',
      'Sophia와의 공급 측 조율 진행 중',
    ],
    risks: [
      '날인/인감 상태가 모호하면 라이브 일정 지연',
      'PIC 인수인계(Aiden) 미문서화 시 맥락 손실 가능',
    ],
    recommendedAction:
      '날인 상태(인감 완료 vs 서명 잔여)를 서면으로 확인한 뒤 API 라이브 키 발급 시점을 직접 문의하세요. Sophia와 공급 준비 상태를 정렬해 인벤토리로 인해 라이브가 막히지 않도록 하세요.',
    nextBestAction: '날인 상태 확인 및 API 라이브 키 발급 시점 요청',
  },
  klook: {
    detectedContext: 'SLA / 계약 리스크',
    currentFocus: '지원·보상 관련 과도한 SLA 책임으로부터 오마이호텔 보호',
    opportunity:
      'Klook과의 균형 잡힌 SLA는 무한 책임 노출 없이 주요 SEA 유통 채널을 유지합니다.',
    summary:
      'Klook의 SLA 초안은 24/7 지원을 요구하지만 이는 불가능합니다 — 오마이호텔 지원 커버리지는 06:00–24:00입니다. 보상 책임을 명확히 하고 정산 주기·보증금·환불·CS 보상 문구를 검토해야 합니다. 우선순위는 채널을 유지하면서 과도한 SLA 책임으로부터 오마이호텔을 보호하는 것입니다.',
    openIssues: [
      '24/7 지원 의무 비현실적(커버리지 06:00–24:00)',
      '보상 책임 문구 미해결',
      '정산 주기·보증금·환불 조건 검토 필요',
      'CS 보상 조항이 과도한 책임에 노출',
    ],
    risks: [
      '문구 미상한 시 무한 SLA 보상 노출',
      '24/7 지원 동의 시 충족 불가능한 운영 의무 발생',
    ],
    recommendedAction:
      '24/7 조항에 실제 06:00–24:00 커버리지와 시간 외 에스컬레이션 경로로 대응하세요. 보상은 문서화된 귀속 가능 실패로 한정하고, CS 보상 문구 동의 전 정산/보증금/환불 문구를 법무와 검토하세요.',
    nextBestAction: '24/7 SLA 조항 대응 및 법무와 보상 문구 상한 설정',
  },
  hotelbeds: {
    detectedContext: '상업 협상 / 연동비',
    currentFocus: 'USD 25,000 환불불가 연동비 면제 또는 유예',
    opportunity:
      'Hotelbeds는 대규모 글로벌 서드파티 인벤토리를 더하지만, 연동 비용이 사업 타당성에 연동될 때만 가치가 있습니다.',
    summary:
      'Hotelbeds가 USD 25,000 연동비를 제안했습니다. 환불 불가 조건이 핵심 문제입니다. 오마이호텔은 면제 또는 유예를 요청했고 리베이트 조건도 명확화가 필요합니다. TGX 승인과 라이브 조건 검토가 필요하며, 원칙은 사업 타당성 확인 전 비용을 확정하지 않는 것입니다.',
    openIssues: [
      'USD 25,000 연동비 — 환불 불가 조건이 문제',
      '면제 또는 유예 요청, 미승인',
      '리베이트 조건 불명확',
      'TGX 승인·라이브 조건 검토 필요',
    ],
    risks: [
      '타당성 검증 전 환불불가 비용 지불은 매몰비용 리스크',
      '소폭의 QoQ 볼륨 둔화로 협상 레버리지 약화',
    ],
    recommendedAction:
      '비용을 성공 연동형으로 재구성하세요: 라이브까지 면제/유예를 요청하고, 비용을 약정 볼륨/리베이트 구조에 연동하며, TGX 승인을 전제 조건으로 하세요. 사업 타당성 확인 전 USD 25,000을 확정하지 마세요.',
    nextBestAction: '라이브·리베이트 연동 조건으로 USD 25,000 면제/유예 요청',
  },
  dida: {
    detectedContext: '예약 실패 / 기술 정확도 이슈',
    currentFocus: '공동 매핑·룸타입 검증 리뷰로 오프라인 정확도 해결',
    opportunity:
      '매핑 정확도 이슈 해결은 신뢰를 회복하고 기존 Dida 볼륨의 이탈을 방지합니다.',
    summary:
      'Dida는 오프라인 정확도 이슈가 있습니다: 룸타입 코드 불일치와 취소 정책 오탐 사례입니다. 공동 리뷰가 필요합니다. 매핑과 룸타입 검증이 핵심이며, 특히 Dida 측 잘못된 룸타입 코드와 실제 오마이호텔 매진 사례를 구분해 책임과 수정을 정확히 배정해야 합니다.',
    openIssues: [
      '오프라인 정확도 이슈 — 룸타입 코드 불일치',
      '취소 정책 오탐 사례',
      '공동 리뷰 미예정',
      'Dida 측 잘못된 코드와 실제 매진 사례 구분 불가',
    ],
    risks: [
      '지속적 매핑 오류로 파트너 신뢰 저하 및 이탈 신호',
      '오귀속된 매진 사례가 불필요한 분쟁 증가',
    ],
    recommendedAction:
      '룸타입 코드 매핑과 취소 정책 검증에 집중한 공동 기술 리뷰를 잡으세요. Dida 측 잘못된 코드와 실제 매진 응답을 분리하는 공유 분류 체계를 구축한 뒤 수정 일정을 전달하세요.',
    nextBestAction: 'Dida와 공동 매핑·룸타입 검증 리뷰 일정 확정',
  },
  traveloka: {
    detectedContext: '프리북 실패 / API 모니터링',
    currentFocus: '자동 정지 임계치 도달 전 프리북 실패 감소',
    opportunity:
      '프리북 성공률 안정화는 인도네시아/베트남의 강한 볼륨을 보호하고 확장의 길을 엽니다.',
    summary:
      'Traveloka는 프리북 성공률에 연동된 자동 정지 임계치가 있습니다. 프리북 실패와 "No Room Available" 오류가 발생하며 VN·KR·MY·JP 실패율을 모니터링해야 합니다. Atlas API 스키마 업데이트가 검토 중입니다. 목표는 볼륨 확장 전 프리북 실패를 줄여 자동 정지를 피하는 것입니다.',
    openIssues: [
      '프리북 성공률이 자동 정지 임계치에 근접',
      '"No Room Available" 오류 증가',
      'VN/KR/MY/JP 시장별 실패율 모니터링 필요',
      'Atlas API 스키마 업데이트 검토 중',
    ],
    risks: [
      '프리북 실패율이 임계치를 넘으면 자동 정지',
      '실패 해결 전 볼륨 확장은 문제를 증폭',
    ],
    recommendedAction:
      '시장별(VN/KR/MY/JP) 프리북 실패 모니터링을 구축하고, 가장 큰 "No Room Available" 원인을 우선 처리하며, Atlas API 스키마 업데이트 검토를 완료하세요. 실패를 먼저 줄인 뒤 확장하세요.',
    nextBestAction: '시장별 프리북 실패 모니터링 구축 및 Atlas 스키마 검토 완료',
  },
  webbeds: {
    detectedContext: '채널 확장 / 프로스펙트 발굴',
    currentFocus: '한국 API 클라이언트 확장에 개발 리소스 투입 여부 결정',
    opportunity:
      'WebBeds는 한국·일본·베트남 다이렉트 컨트랙트 중심의 약 30개 잠재 프로스펙트로 한국 API 클라이언트 확장 경로를 엽니다.',
    summary:
      'WebBeds는 한국 API 클라이언트 확장 기회이나 현재 개발 우선순위가 낮습니다. 한국/일본/베트남 다이렉트 컨트랙트 중심으로 약 30개 잠재 프로스펙트를 발굴해야 합니다. 초기 신호상 일본·베트남 경쟁력이 예상보다 약합니다. 핵심 결정은 지금 개발 리소스를 투입할지 보류할지입니다.',
    openIssues: [
      '개발 우선순위 현재 낮음',
      '약 30개 잠재 프로스펙트 미발굴',
      '일본·베트남 경쟁력 예상보다 약함',
      '리소스 우선순위 결정 보류',
    ],
    risks: [
      '약한 JP/VN 경쟁력에 개발 리소스 투입 시 낭비 가능',
      '지연이 길어지면 한국 다이렉트 컨트랙트 기회를 경쟁사에 내줌',
    ],
    recommendedAction:
      '한국 우선 30개 프로스펙트 리스트를 구축하고, 개발 리소스 투입 전 실제 요율 비교로 일본/베트남 경쟁력을 검증하세요. 한국 다이렉트 컨트랙트 강점을 근거로 명확한 진행/보류를 결정하세요.',
    nextBestAction: '한국 30개 프로스펙트 리스트 구축 및 JP/VN 요율 검증',
  },
  poseidon: {
    detectedContext: '공급사 정책 / 액티비티 상품 운영',
    currentFocus: '선결제·현장 결제·노쇼 통제 정렬 후 판매 셋업 완료',
    opportunity:
      'Poseidon의 액티비티 상품은 정책·판매 셋업 정렬 후 네이버 스마트스토어를 통해 한국 아웃바운드 시장에 판매할 수 있습니다.',
    summary:
      'Poseidon은 연령 규정과 취소 정책이 확정되었고, 결제 정책은 최소 50% 선결제를 요구합니다. 현장 결제 처리와 노쇼 통제를 정렬하고, 상품 이미지와 네이버 스마트스토어 판매 프로세스를 명확히 한 뒤 등록해야 합니다.',
    openIssues: [
      '현장 결제 처리 미정렬',
      '노쇼 통제 프로세스 미정의',
      '상품 이미지 미확정',
      '네이버 스마트스토어 판매 프로세스 미명확',
    ],
    risks: [
      '현장 결제 시 약한 노쇼 통제는 매출 누수 증가',
      '미완성 상품 이미지/프로세스로 스마트스토어 등록 지연',
    ],
    recommendedAction:
      '확정된 50% 선결제 정책 위에 현장 결제·노쇼 통제 규칙을 확정한 뒤, 상품 이미지와 네이버 스마트스토어 판매 흐름을 마무리해 한국 아웃바운드 판매를 시작하세요.',
    nextBestAction: '현장 결제·노쇼 통제 정렬 후 스마트스토어 등록 마무리',
  },
  aphrodite: {
    detectedContext: '공급사 상품 / 요트 운영',
    currentFocus: '결제·여권·기상 취소·차터·음료 결제 프로세스 확정',
    opportunity:
      '프리미엄 에게해 요트 차터 상품은 그리스 아웃바운드 포트폴리오를 차별화하며, 보증금도 이미 납부되어 있습니다.',
    summary:
      'Aphrodite Yacht는 럭셔리 차터 상품으로 공급사에 이미 보증금이 납부되었습니다. 운영을 위해 결제 방법, 여권 정보 정책, 기상 취소·환불 규칙, 차터 조건, 선상 음료 결제 프로세스를 확정해야 합니다.',
    openIssues: [
      '결제 방법 미확정',
      '여권 정보 정책 미정의',
      '기상 취소·환불 규칙 미정',
      '차터 조건·음료 결제 프로세스 불명확',
    ],
    risks: [
      '보증금이 이미 납부되어 조건 불명확 시 노출 증가',
      '고가 차터는 결제·취소 리스크가 높음',
    ],
    recommendedAction:
      '보증금이 이미 납부된 만큼, 출시 전 결제 방법·여권 정책·기상 취소/환불 규칙·차터 조건·음료 결제 흐름을 우선 확정해 선납 포지션을 보호하세요.',
    nextBestAction: '결제·여권·기상 취소·차터·음료 조건 확정',
  },
  chaletkorea: {
    detectedContext: '파트너 연결성 / B2B 세일즈 기회',
    currentFocus: 'iTANK를 통한 API 연결 가능성 확인 및 관계 유형 정의',
    opportunity:
      'Chalet Korea는 iTANK 연동을 통해 연결된 공급 파트너가 되어 채널에 한국 인벤토리를 더할 수 있습니다.',
    summary:
      'Chalet Korea는 iTANK 연결성과 관련된 잠재 파트너입니다. API 연결 가능 여부를 확인하고, 세일즈 잠재력과 호텔 공급 범위를 점검하며, 향후 커뮤니케이션을 토대로 채널·공급사·B2B 중 어느 맥락인지 명확히 해야 합니다. OAC는 잠정적으로 파트너 연결성/B2B 세일즈 맥락을 감지했습니다.',
    openIssues: [
      'iTANK 통한 API 연결 가능성 미확정',
      '세일즈 잠재력·호텔 공급 범위 미파악',
      '관계 유형(채널/공급사/B2B) 미명확',
    ],
    risks: [
      '맥락 모호성으로 노력 우선순위 오배정 가능',
      '공급 범위가 여기어때 CEO 보고의 핵심 경로',
    ],
    recommendedAction:
      'iTANK에 Chalet Korea를 동일 연동으로 연결할 수 있는지 확인한 뒤 인벤토리와 세일즈 잠재력을 산정하세요. 공급 확정을 여기어때 CEO 보고에 연결해 구체적 수치를 제시하세요.',
    nextBestAction: 'iTANK API 가능성 확인 및 Chalet Korea 공급 범위 산정',
  },
  taiwanhrc: {
    detectedContext: '파트너 연결성 / B2B 확장',
    currentFocus: 'API 가능성·타깃 목적지·정산·예상 볼륨 확인',
    opportunity:
      'Taiwan HRC는 iTANK 연결을 통해 채널에 대만 인벤토리와 아웃바운드 수요를 더할 수 있습니다.',
    summary:
      'Taiwan HRC는 iTANK 연결성과 관련된 잠재 파트너입니다. API 연결 가능 여부를 확인하고, 연동 범위에 포함하기 전 타깃 목적지, 정산 조건(통화/주기), 예상 세일즈 볼륨을 파악해야 합니다.',
    openIssues: [
      'iTANK 통한 API 연결 가능성 미확정',
      '타깃 목적지 미파악',
      '정산 조건(통화/주기) 미정',
      '예상 세일즈 볼륨 미파악',
    ],
    risks: [
      '통화/정산 마찰로 공급 확정 지연 가능',
      '미파악 볼륨으로 우선순위 판단 어려움',
    ],
    recommendedAction:
      'Taiwan HRC의 iTANK API 가능성을 확인한 뒤 타깃 목적지, 정산 통화/주기, 예상 볼륨을 수집해 Chalet Korea와 함께 API 보고에 포함하세요.',
    nextBestAction: 'API 가능성 확인 및 목적지·정산·볼륨 수집',
  },
}

export const todaysBriefingKo =
  '오늘 OAC는 여러 우선 맥락을 감지했습니다. 여기어때는 API 연결성을 위한 iTANK 공식 문의가 필요합니다. Klook은 24/7 지원과 보상 문구 관련 SLA 리스크가 있습니다. 그랜드 하얏트 제주는 7월 요율·가용성에 대한 호텔 컨트랙팅 후속 조치가 필요합니다. Medical Korea Service는 명확한 넷 요율·선불 정산 설명이 필요합니다. Dida는 오프라인 정확도 이슈로 기술 검토가 필요합니다.'

// ── Tasks ────────────────────────────────────────────────────────────────
export const taskKo: Record<string, { title: string; aiReason: string }> = {
  'tk-1': { title: 'helpdesk@itank.net으로 공식 API 연동 문의 발송', aiReason: '유일한 게이팅 액션 — 엔지니어링 배정과 CEO 보고가 모두 여기에 달려 있음.' },
  'tk-2': { title: '한국/일본/베트남 공급 범위 확정(Chalet Korea·Taiwan HRC 포함)', aiReason: '공급 범위 확정 전에는 CEO 보고에 정확한 인벤토리 수치를 제시할 수 없음.' },
  'tk-3': { title: '7월 넷 요율·가용성·스위트 요율·ALM·여름 프로모션 요청', aiReason: '성수기 전 7월 스위트 인벤토리가 소진될 수 있음.' },
  'tk-4': { title: '24/7 SLA 조항 대응 및 법무와 보상 문구 상한 설정', aiReason: '충족 불가 의무와 무한 보상 책임으로부터 오마이호텔 보호.' },
  'tk-5': { title: '공동 매핑·룸타입 검증 리뷰 일정 확정', aiReason: '포트폴리오 최악의 실패·취소율, 근본 원인은 수요가 아닌 매핑 정확도.' },
  'tk-6': { title: '라이브·리베이트 연동 USD 25,000 면제/유예 요청', aiReason: '사업 타당성 확인 전 환불불가 비용 확정 회피.' },
  'tk-7': { title: '구조화된 넷 요율·선불 정산 협업 요약 발송', aiReason: '정산 명확성이 기업 협업 진행의 신뢰 관문.' },
  'tk-8': { title: '날인 상태 확인 및 API 라이브 키 발급 시점 요청', aiReason: '날인/서명 확인과 라이브 키만 해결하면 라이브 가능.' },
  'tk-9': { title: '시장별(VN/KR/MY/JP) 프리북 실패 모니터링 구축', aiReason: '자동 정지 임계치 도달 전 프리북 실패 감소.' },
  'tk-10': { title: 'SUP 패들 투어 최종 상품 시트·운영 조건 요청', aiReason: '기상 취소 정책이 수상 액티비티의 핵심 출시 차단 요소.' },
  'tk-11': { title: '예약 마감·결제·기상/계절 운영 규칙 확정', aiReason: '겨울/우기 운영 규칙으로 우기 취소 분쟁 예방.' },
  'tk-12': { title: 'iTANK API 가능성 확인 및 Chalet Korea 공급 범위 산정', aiReason: 'Chalet Korea 공급이 여기어때 CEO 보고의 핵심 경로.' },
  'tk-13': { title: 'Taiwan HRC 목적지·정산 통화·예상 볼륨 수집', aiReason: 'API 범위 포함 전 정산 통화 해결 필요.' },
  'tk-14': { title: '현장 결제·노쇼 통제 정렬, 스마트스토어 등록 마무리', aiReason: '현장 결제 시 노쇼 통제가 핵심 매출 누수 리스크.' },
  'tk-15': { title: '결제·여권·기상 취소·차터 조건 확정', aiReason: '보증금이 이미 납부되어 조건 미정 시 재무 노출 증가.' },
  'tk-16': { title: '한국 30개 프로스펙트 리스트 구축 및 JP/VN 경쟁력 검증', aiReason: '개발 리소스 투입 전 한국 다이렉트 컨트랙트 강점 검증.' },
}

// ── Insights ─────────────────────────────────────────────────────────────
interface InsightKo {
  insightSummary: string
  recommendedActions: string[]
  riskWarnings: string[]
  strategicDirection: string
  nextBestAction: string
}
export const insightKo: Record<string, InsightKo> = {
  yeogi: {
    insightSummary: '여기어때는 단일 발신 액션에 막힌 고레버리지 API 연동 기회입니다. 감지된 맥락: API 연동 / 채널 확장.',
    recommendedActions: ['오늘 helpdesk@itank.net으로 공식 문의 발송', '한국/일본/베트남 공급 범위 확정(Chalet Korea·Taiwan HRC 포함)', '구체적 인벤토리 수치를 담은 CEO 보고 준비', '개발팀에 API 타당성·공수 확인 요청'],
    riskWarnings: ['공식 문의가 한 주 더 지연되면 모멘텀 정지', '공급 수치 확정 전 CEO 보고 진행 불가'],
    strategicDirection: '하나의 iTANK 연동으로 한국·일본·베트남 공급을 동시에 열어 단일 파트너 연결이 아닌 채널 확장 플랫폼으로 다루세요.',
    nextBestAction: 'helpdesk@itank.net으로 공식 API 연동 문의 발송',
  },
  itank: {
    insightSummary: 'iTANK는 한국 클러스터 전체의 연결 게이트키퍼입니다. 감지된 맥락: 기술 파트너 / API 연결성.',
    recommendedActions: ['6개 확인 항목을 담은 단일 구조화 문의 제출', '연결 가능 파트너 범위 요청(여기어때·Chalet Korea·Taiwan HRC)', '필요 서류·기술 프로세스 요청', '상업 모델·예상 일정 확인'],
    riskWarnings: ['공식 문의 접수 전 엔지니어링 배정 차단', '불명확한 상업 모델로 예상치 못한 연동 비용 발생 가능'],
    strategicDirection: 'iTANK를 플랫폼 파트너로 보고, 하나의 깔끔한 연동으로 여러 유통 파트너를 열 수 있도록 범위를 선제적으로 명확화하세요.',
    nextBestAction: 'helpdesk@itank.net에 전체 구조화 문의 발송',
  },
  grandhyatt: {
    insightSummary: '그랜드 하얏트 제주는 다이렉트 컨트랙트 준비가 되어 있고 상업 조건만 남았습니다. 감지된 맥락: 호텔 컨트랙팅 / 요율 협상.',
    recommendedActions: ['넷 요율·7월 가용성·스위트 요율 요청', '성수기 주말 얼롯먼트(ALM) 합의', '취소 정책·여름 프로모션 확정', '가족/VIP 수요로 다이렉트 조건 정당화'],
    riskWarnings: ['조건 확정 전 7월 스위트 인벤토리 소진 가능'],
    strategicDirection: '대표 제주 다이렉트 컨트랙트와 성수기 얼롯먼트로 한국 인바운드와 VIP 가족 수요를 선점하세요.',
    nextBestAction: '넷 요율·ALM·취소 정책·여름 프로모션 요청',
  },
  medkorea: {
    insightSummary: 'Medical Korea Service는 약정 전 정산 명확성이 필요합니다. 감지된 맥락: 기업 고객 / 넷 요율 세일즈.',
    recommendedActions: ['구조화된 넷 요율 협업 요약 발송', '램프업 기간 선불 정산 설명', '보장 예약 프로세스 문서화', '호텔별 취소·변경 규정 정리'],
    riskWarnings: ['넷 vs 커미션 혼동으로 거래 지연 가능', '볼륨 검증 전 선불 조건 부재 시 정산 리스크 상승'],
    strategicDirection: '넷 요율·정산 모델을 투명하고 저리스크로 만들어 반복적 장기 의료관광 수요를 확보하세요.',
    nextBestAction: '구조화된 넷 요율·선불 정산 요약 발송',
  },
  supdanang: {
    insightSummary: 'SUP 다낭 상품 셋업이 운영 조건에 막혀 있습니다. 감지된 맥락: 공급사 상품 / 운영 셋업.',
    recommendedActions: ['최종 상품 시트·넷 가격 요청', '일정·예약 마감 시간 설정', '기상 취소 정책 확정', '정산 방법·고객 준비물 확인'],
    riskWarnings: ['기상 취소 모호성이 최대 고객 경험 리스크'],
    strategicDirection: '기상 정책을 먼저 해결해 깔끔한 고마진 액티비티 상품을 출시하세요 — 성패를 가르는 운영 디테일입니다.',
    nextBestAction: '최종 상품 시트와 전체 운영 조건 요청',
  },
  danangsurf: {
    insightSummary: '다낭 홀리데이 서프는 예약·계절 운영 규칙이 필요합니다. 감지된 맥락: 공급사 상품 / 예약 운영.',
    recommendedActions: ['예약 마감·결제 방법 확정', '기상 취소·환불 정책 문서화', '겨울/우기 운영 규칙 정의', '다낭 교차 판매용 서프+SUP 번들 검토'],
    riskWarnings: ['계절 가용성 혼선으로 우기 취소 발생 가능'],
    strategicDirection: '레슨+렌탈+사진+무료 서핑 포함을 차별화된 다낭 액티비티 번들로 구성하세요.',
    nextBestAction: '마감·결제·기상/계절 운영 규칙 확정',
  },
  goglobal: {
    insightSummary: 'GoGlobal은 서명 하나, 키 하나로 라이브 가능합니다. 감지된 맥락: SLA / API 파트너십.',
    recommendedActions: ['법인 인감 완료·서명 잔여 여부 확인', 'API 라이브 키 발급 시점 문의', 'Sophia와 공급 준비 정렬', 'Aiden으로 PIC 인수인계 문서화'],
    riskWarnings: ['날인 상태가 모호하면 라이브 지연'],
    strategicDirection: '검토 완료된 SLA를 신속히 라이브 유통으로 전환하세요 — 파트너는 준비됐고 차단 요소는 행정적입니다.',
    nextBestAction: '날인 상태 확인 및 API 라이브 키 요청',
  },
  klook: {
    insightSummary: 'Klook의 SLA는 오마이호텔을 과도한 책임에 노출시킵니다. 감지된 맥락: SLA / 계약 리스크.',
    recommendedActions: ['24/7 조항을 06:00–24:00+에스컬레이션 경로로 대응', '보상을 문서화된 귀속 가능 실패로 한정', '정산 주기·보증금·환불 문구 법무 검토', '플래시세일 실패율 완화 계획 공유'],
    riskWarnings: ['문구 미상한 시 무한 보상 노출', '24/7 동의 시 운영이 충족 불가한 의무 발생'],
    strategicDirection: '책임을 한정하면서 주요 SEA 채널을 유지하세요 — 양보가 아닌 균형이 장기 파트너십을 지킵니다.',
    nextBestAction: '24/7 SLA 조항 대응 및 법무와 보상 상한 설정',
  },
  hotelbeds: {
    insightSummary: 'Hotelbeds는 타당성 검증 전 환불불가 비용을 요구합니다. 감지된 맥락: 상업 협상 / 연동비.',
    recommendedActions: ['라이브까지 USD 25,000 면제/유예 요청', '비용을 약정 볼륨·리베이트 구조에 연동', 'TGX 승인을 전제 조건으로', '약정 전 라이브 조건 확정'],
    riskWarnings: ['타당성 전 환불불가 비용 지불은 매몰비용 리스크', '정체된 QoQ 볼륨이 비용 레버리지 약화'],
    strategicDirection: '검증된 사업 가치에만 비용을 약정하세요 — 정액 비용을 성공 연동·볼륨 연계 조건으로 전환하세요.',
    nextBestAction: '라이브·리베이트 연동 면제/유예 요청',
  },
  dida: {
    insightSummary: 'Dida의 실패는 대부분 자체의 잘못된 룸타입 코드이며 매진이 아닙니다. 감지된 맥락: 예약 실패 / 기술 정확도 이슈.',
    recommendedActions: ['공동 매핑·룸타입 검증 리뷰 일정', '잘못된 코드와 실제 매진을 분리하는 공유 규칙 구축', '마스터 인벤토리·불일치 예약 목록 전달', 'Dida에 수정 일정 전달'],
    riskWarnings: ['지속적 매핑 오류로 신뢰 저하 및 이탈 신호', '오귀속된 매진 사례가 분쟁 증가'],
    strategicDirection: '최대 단일 실패 원인(Dida 측 잘못된 코드 52%)을 공동 기술 수정으로 회복하세요 — 구조적이 아닌 회복 가능한 감소입니다.',
    nextBestAction: '공동 매핑·룸타입 검증 리뷰 일정 확정',
  },
  traveloka: {
    insightSummary: 'Traveloka 프리북 실패가 자동 정지 임계치에 근접합니다. 감지된 맥락: 프리북 실패 / API 모니터링.',
    recommendedActions: ['시장별(VN/KR/MY/JP) 프리북 실패 모니터링 구축', '최대 "No Room Available" 원인 우선 처리', 'Atlas API 스키마 업데이트 검토 완료', '실패 감소 전 볼륨 확장 보류'],
    riskWarnings: ['실패율이 임계치를 넘으면 자동 정지'],
    strategicDirection: '확장 전 프리북 경로를 안정화하세요 — 자동 정지 위험 대신 강한 인도네시아/베트남 볼륨을 보호하세요.',
    nextBestAction: '시장별 프리북 실패 모니터링 구축',
  },
  webbeds: {
    insightSummary: 'WebBeds는 한국 우선 기회이나 JP/VN 경제성이 약합니다. 감지된 맥락: 채널 확장 / 프로스펙트 발굴.',
    recommendedActions: ['한국 우선 30개 프로스펙트 리스트 구축', '실제 비교로 일본/베트남 요율 경쟁력 검증', '개발 리소스 진행/보류 명확히 결정', '한국이 강한 다이렉트 컨트랙트에 집중'],
    riskWarnings: ['약한 JP/VN 경쟁력에 투입 시 개발 리소스 낭비 가능', '지연 시 한국 기회를 경쟁사에 내줌'],
    strategicDirection: '데이터가 강한 한국 다이렉트 컨트랙트 확장을 우선하고, 경쟁력 검증 전까지 JP/VN은 보류하세요.',
    nextBestAction: '한국 30개 프로스펙트 리스트 구축 및 JP/VN 요율 검증',
  },
  poseidon: {
    insightSummary: 'Poseidon은 거의 준비됐고 판매 운영 디테일만 남았습니다. 감지된 맥락: 공급사 정책 / 액티비티 상품 운영.',
    recommendedActions: ['현장 결제 처리·노쇼 통제 정렬', '상품 이미지 확정', '네이버 스마트스토어 판매 프로세스 명확화', '한국 아웃바운드 시장에 상품 등록'],
    riskWarnings: ['현장 결제 시 약한 노쇼 통제는 매출 누수 증가'],
    strategicDirection: '확정된 액티비티 상품을 강한 노쇼 통제와 함께 네이버 스마트스토어로 한국 아웃바운드 시장에 출시하세요.',
    nextBestAction: '현장 결제·노쇼 통제 정렬, 스마트스토어 등록 마무리',
  },
  aphrodite: {
    insightSummary: 'Aphrodite는 보증금은 납부됐지만 운영 조건이 미정입니다. 감지된 맥락: 공급사 상품 / 요트 운영.',
    recommendedActions: ['결제 방법 확정', '여권 정보 정책 정의', '기상 취소·환불 규칙 확정', '차터 조건·음료 결제 프로세스 명확화'],
    riskWarnings: ['보증금이 이미 납부되어 조건 미정 시 재무 노출 증가'],
    strategicDirection: '프리미엄 요트 차터 상품으로 그리스 포트폴리오를 차별화하되, 고가 예약 조건을 견고히 보호하세요.',
    nextBestAction: '결제·여권·기상 취소·차터 조건 확정',
  },
  chaletkorea: {
    insightSummary: 'Chalet Korea 연결성은 iTANK에 달려 있고 여기어때 보고에 기여합니다. 감지된 맥락: 파트너 연결성 / B2B 세일즈 기회.',
    recommendedActions: ['iTANK에 Chalet Korea 연결 가능 여부 확인', '인벤토리·세일즈 잠재력 산정', '향후 커뮤니케이션으로 관계 유형 결정', '공급 확정을 여기어때 CEO 보고에 연결'],
    riskWarnings: ['공급 범위가 여기어때 보고의 핵심 경로'],
    strategicDirection: 'Chalet Korea 공급을 조기에 확정해 여기어때 CEO 보고가 구체적 인벤토리 수치를 제시하도록 하세요.',
    nextBestAction: 'iTANK 가능성 확인 및 Chalet Korea 공급 범위 산정',
  },
  taiwanhrc: {
    insightSummary: 'Taiwan HRC 연결성은 정산 명확성에 막혀 있습니다. 감지된 맥락: 파트너 연결성 / B2B 확장.',
    recommendedActions: ['Taiwan HRC iTANK API 가능성 확인', '타깃 목적지 파악', '정산 통화(TWD vs USD)·주기 결정', '예상 세일즈 볼륨 산정'],
    riskWarnings: ['통화/정산 마찰로 공급 확정 지연 가능'],
    strategicDirection: '정산 통화를 먼저 해결해 API 범위 일정을 지키며 채널에 대만 인벤토리와 아웃바운드 수요를 더하세요.',
    nextBestAction: 'API 가능성 확인 및 목적지·정산·볼륨 수집',
  },
}

// ── salesData aiComment ────────────────────────────────────────────────────
export const salesAiCommentKo: Record<string, string> = {
  yeogi: '파이프라인 볼륨이 한국 중심으로 꾸준히 상승 중입니다. 다이렉트 컨트랙트 비중(58%)이 건전하며, API 연동 시 수요가 이미 존재하는 일본·베트남 공급을 확장할 수 있습니다.',
  goglobal: '실패율이 낮은(1.8%) 강력한 라이브 파트너입니다. 일본 인벤토리가 요율에서 우위입니다. 레버는 폭(breadth)으로, SLA·라이브 키 완료 후 베트남 다이렉트 공급 확장이 볼륨을 더 끌어올립니다.',
  klook: '실패율(5.6%)이 높고 플래시세일 피크에 집중되어 있습니다 — SLA 분쟁을 유발한 바로 그 이벤트입니다. 보상을 귀속 가능한 피크 실패로 한정하고 조건 확정 전 플래시세일 완화 계획을 전달하세요.',
  hotelbeds: '볼륨이 소폭 둔화(-1.3% QoQ)됐고 다이렉트 컨트랙트 비중이 낮습니다(12%). 볼륨이 정체된 상황에서 정액 환불불가 USD 25,000은 가치가 낮으므로 연동비를 성공 연동형으로 전환하세요.',
  dida: '포트폴리오 최악의 실패(7.9%)·취소(12.4%)율이며 -6.7% QoQ로 감소 중입니다. 실패의 52%가 Dida 측 잘못된 룸타입 코드(실제 매진 아님)로, 공동 매핑 리뷰로 대부분을 회복할 수 있습니다.',
  traveloka: '볼륨은 건전하나 실패의 49%가 프리북 "No Room Available"로, Traveloka 자동 정지 임계치와 직결됩니다. 볼륨 확장 전 시장별 프리북 경로를 고치세요.',
  webbeds: '한국 성장이 빠르나(+22% QoQ) 실패의 46%가 약한 JP/VN 요율 경쟁력에서 비롯됩니다. 한국이 강점이니 투입 전 JP/VN을 검증하세요.',
  itank: 'iTANK 회신을 기다리는 6개 항목(옵션·서류·프로세스·상업 모델·일정·파트너 범위). 엔지니어링은 공식 문의를 전제로 하므로, 발송으로 클러스터 전체를 차단 해제하세요.',
  grandhyatt: '호텔이 다이렉트 컨트랙트에 열려 있습니다. 요율·ALM·취소 정책·여름 프로모션이 4개 보류 항목입니다. 7월 인벤토리는 시간 민감하므로 성수기 전 조건을 확정하세요.',
  medkorea: '협업은 넷 요율·선불 정산 모델 설명에 달려 있습니다. 정산·보장 예약·호텔별 취소 규정을 문서화해 관심을 약정으로 전환하세요.',
  supdanang: '상품(Sunrise/Sunset SUP 패들 투어)이 선정됐습니다. 넷 가격·마감·기상 정책·정산·준비물이 보류 중이며, 기상 취소 정책이 핵심 출시 차단 요소입니다.',
  danangsurf: '일정과 포함 항목이 명확합니다(09:00/14:30, 렌탈+사진+무료 서핑). 마감·결제·겨울/우기 운영 규칙이 남아 있으니 계절 분쟁을 막기 위해 문서화하세요.',
  poseidon: '연령·취소 정책과 50% 선결제가 확정됐습니다. 남은 항목: 현장 결제·노쇼 통제·상품 이미지·네이버 스마트스토어 흐름.',
  aphrodite: '보증금이 이미 납부되어 노출이 큽니다. 출시 전 결제 방법·여권 정책·기상 취소 환불·차터 조건·음료 결제를 확정해야 합니다.',
  chaletkorea: '연결성은 iTANK에 달려 있습니다. API 가능성을 확인한 뒤 공급·세일즈 잠재력을 산정하세요 — 이 인벤토리가 여기어때 CEO 보고 수치에 기여합니다.',
  taiwanhrc: '연결성은 iTANK에 달려 있습니다. 타깃 목적지·정산 통화(TWD vs USD)·예상 볼륨이 미정이므로 정산을 먼저 해결해 API 범위 일정을 지키세요.',
}

// ── Meetings ───────────────────────────────────────────────────────────────
interface MeetingKo {
  title: string
  aiSummary: string
  keyPoints: string[]
  decisions: string[]
  openIssues: string[]
  followUps: string[]
  risks: string[]
}
export const meetingKo: Record<string, MeetingKo> = {
  'mtg-yeogi-0605': {
    title: '여기어때 — API 연동 범위 협의',
    aiSummary: '여기어때가 한국·일본·베트남 공급을 아우르는 API 연동에 관심을 확인했습니다. iTANK는 엔지니어 배정 전 helpdesk@itank.net으로 공식 문의를 요구합니다. Chalet Korea·Taiwan HRC가 동일 연동 후보로 거론됐습니다. 구체적 인벤토리 수치와 상업 조건을 담은 CEO 보고가 승인 관문입니다.',
    keyPoints: ['iTANK는 리소스 배정 전 공식 이메일 문의 요구', '목표 공급 범위는 한국·일본·베트남', 'Chalet Korea·Taiwan HRC가 동일 연동 후보로 거론', 'CEO 승인에는 인벤토리 수치+상업 조건 필요'],
    decisions: ['직접 연동이 아닌 iTANK 기술 레이어를 통해 진행', '엔지니어링 착수 전 공식 문의 발송'],
    openIssues: ['공급 범위(한국/일본/베트남) 미수치화', '상업 조건 미정의'],
    followUps: ['helpdesk@itank.net으로 공식 API 문의 발송', 'Chalet Korea·Taiwan HRC 연결 범위 확정', '인벤토리·상업 프레이밍을 담은 CEO 보고 준비'],
    risks: ['공식 문의 없이는 기회 정체; 공급 수치 없이는 CEO 보고 차단'],
  },
  'mtg-itank-0605': {
    title: 'iTANK — 공식 채널 및 연동 옵션',
    aiSummary: 'iTANK와의 커뮤니케이션이 공식적으로 메신저에서 이메일로 전환됐습니다. iTANK는 모든 요청을 helpdesk@itank.net으로 제출하도록 요청했습니다. 오마이호텔은 연동 옵션·필요 서류·기술 프로세스·상업 모델·예상 일정·연결 가능 파트너 목록을 확보해야 하며, 엔지니어링 리소스는 공식 문의를 전제로 합니다.',
    keyPoints: ['모든 커뮤니케이션은 helpdesk@itank.net 경유', '확인 6개 항목: 옵션·서류·프로세스·상업 모델·일정·파트너 범위', '엔지니어링 배정은 공식 문의 전제'],
    decisions: ['6개 항목을 모두 담은 단일 구조화 문의 제출'],
    openIssues: ['연동 옵션·상업 모델·일정 모두 미파악'],
    followUps: ['helpdesk@itank.net으로 구조화 문의 작성·발송'],
    risks: ['공식 문의 지연이 한국 연결 클러스터 전체를 차단'],
  },
  'mtg-grandhyatt-0608': {
    title: '그랜드 하얏트 제주 — 7월 컨트랙팅 및 요율',
    aiSummary: '그랜드 하얏트 제주가 다이렉트 컨트랙트에 열려 있습니다. 7월 성수기를 위해 가용성과 스위트 요율 확정이 필요합니다. 가족·럭셔리 VIP 수요가 강합니다. 취소 정책·얼롯먼트(ALM)·여름 프로모션이 미합의 상태이며, 호텔은 다이렉트 조건의 대가로 명확한 얼롯먼트 약정을 원합니다.',
    keyPoints: ['호텔이 다이렉트 컨트랙트에 열려 있음', '7월 가용성·스위트 요율이 즉시 필요', '강한 가족/럭셔리 VIP 수요 신호', '다이렉트 조건 대가로 얼롯먼트 약정 기대'],
    decisions: ['성수기 7월 얼롯먼트를 확보한 다이렉트 컨트랙트 추진'],
    openIssues: ['스위트 요율·ALM·취소 정책·여름 프로모션 미확정'],
    followUps: ['넷 요율·7월 가용성·스위트 요율 요청', '얼롯먼트(ALM)·취소 정책 합의', '여름 프로모션 조건 제안'],
    risks: ['조건 확정 전 7월 스위트 인벤토리 소진 가능'],
  },
  'mtg-medkorea-0604': {
    title: 'Medical Korea Service — 협업 및 넷 요율 모델',
    aiSummary: 'Medical Korea Service가 넷 요율 모델로 협업을 원합니다: 오마이호텔이 넷 요율을 공급하고 MKS가 자체 마크업을 적용합니다. 넷 정산 모델을 명확히 설명해야 하며, 볼륨 안정까지 선불 구조가 유력합니다. 보장 예약 프로세스가 MKS에 불명확하고 호텔별 취소/변경 규정 문서화가 필요합니다.',
    keyPoints: ['고객 측 마크업이 있는 넷 요율 모델', '램프업 기간 선불 정산 유력', '보장 예약 프로세스 설명 필요', '취소/변경 규정이 호텔별로 상이'],
    decisions: ['램프업 기간 선불 조건으로 넷 요율 협업 진행'],
    openIssues: ['정산 모델·보장 예약·취소 규정 미문서화'],
    followUps: ['구조화된 협업 조건 요약 발송', '보장 예약 흐름 문서화', '호텔별 취소/변경 규정 정리'],
    risks: ['넷 vs 커미션 혼동으로 거래 지연 가능'],
  },
  'mtg-supdanang-0603': {
    title: 'SUP 다낭 — 패들 투어 상품 셋업',
    aiSummary: 'Sunrise/Sunset SUP 패들 투어가 셋업 대상으로 선정됐습니다. 출시를 위해 최종 상품 시트·넷 가격·일정·예약 마감·기상 취소 정책·정산 방법·고객 준비물이 필요합니다. 기상 취소 정책이 수상 액티비티의 핵심 운영 리스크입니다.',
    keyPoints: ['Sunrise/Sunset SUP 패들 투어를 상품으로 확정', '상품 시트·넷 가격·일정 미정', '기상 취소 정책이 핵심 운영 우려'],
    decisions: ['시트·정책 수령 후 상품 셋업 진행'],
    openIssues: ['넷 가격·마감·기상 정책·정산·준비물 미정의'],
    followUps: ['최종 상품 시트와 전체 운영 조건 요청'],
    risks: ['기상 취소 모호성으로 출시 시 고객 경험 클레임 위험'],
  },
  'mtg-danangsurf-0602': {
    title: '다낭 홀리데이 서프 — 예약 운영',
    aiSummary: '다낭 홀리데이 서프는 09:00·14:30 클래스를 렌탈·사진 포함으로 제공하며 레슨 후 당일 무료 서핑이 가능합니다. 운영상 예약 마감·결제 방법을 정하고, 기상 취소/환불 정책을 명확히 하며, 겨울/우기 운영 프로세스를 확정해야 합니다.',
    keyPoints: ['고정 09:00/14:30 일정, 렌탈+사진+당일 무료 서핑', '예약 마감·결제 방법 미정의', '겨울/우기 운영에 명시 규칙 필요'],
    decisions: ['상품 등록 전 운영 규칙 문서화'],
    openIssues: ['마감·결제·기상 환불·계절 운영 미확정'],
    followUps: ['마감·결제 방법 확정', '기상/계절 운영 규칙 문서화'],
    risks: ['계절 가용성 혼선으로 우기 취소 발생 가능'],
  },
  'mtg-goglobal-0607': {
    title: 'GoGlobal Travel — SLA 날인 및 라이브 키',
    aiSummary: 'GoGlobal SLA 검토가 완료됐습니다. 미해결 절차 사항은 날인 — 법인 인감 완료 여부와 서명 잔여 여부입니다. Aiden이 상업 PIC, Sophia가 공급 측 조율을 맡습니다. 라이브의 주요 차단 요소는 API 라이브 키 발급 시점입니다.',
    keyPoints: ['SLA 검토 완료; 날인/인감 상태 모호', '상업 PIC가 Aiden으로 인계, 공급 조율은 Sophia', 'API 라이브 키 시점이 라이브 차단 요소'],
    decisions: ['날인 상태를 서면 확인하고 라이브 키 시점 요청'],
    openIssues: ['인감/서명 상태 불명확; 라이브 키 미수령'],
    followUps: ['인감 완료·서명 잔여 여부 확인', 'GoGlobal에 API 라이브 키 발급 시점 문의', 'Sophia와 공급 준비 정렬'],
    risks: ['날인 상태가 모호하면 라이브 지연'],
  },
  'mtg-klook-0604': {
    title: 'Klook — SLA 및 지원 의무 검토',
    aiSummary: 'Klook SLA가 24/7 지원을 요구하지만 오마이호텔은 충족 불가합니다(커버리지 06:00–24:00). 보상 책임이 불명확하고 정산 주기·보증금·환불·CS 보상 문구 검토가 필요합니다. 목표는 과도한 책임으로부터 오마이호텔 보호이며, 절충안으로 시간 외 에스컬레이션 경로를 제안합니다.',
    keyPoints: ['24/7 지원 의무 비현실적(06:00–24:00 커버리지)', '보상 문구가 과도한 책임 유발 가능', '정산 주기·보증금·환불 조건 검토 필요'],
    decisions: ['24/7 조항에 커버리지 시간+시간 외 에스컬레이션으로 대응'],
    openIssues: ['보상 상한·CS 문구 미해결'],
    followUps: ['24/7 조항을 06:00–24:00+에스컬레이션으로 대응', '보상을 귀속 가능 실패로 한정(법무 검토)', '정산/보증금/환불 문구 검토'],
    risks: ['문구 미상한 시 무한 보상 노출'],
  },
  'mtg-hotelbeds-0603': {
    title: 'Hotelbeds — 연동비 협상',
    aiSummary: 'Hotelbeds가 환불 불가 조건의 USD 25,000 연동비를 제안했고, 이것이 핵심 이슈입니다. 오마이호텔은 면제 또는 유예를 요청했습니다. 리베이트 조건이 불명확하고 TGX 승인·라이브 조건 검토가 필요합니다. 지침은 사업 타당성 확인 전 비용을 약정하지 않는 것입니다.',
    keyPoints: ['USD 25,000 환불불가 연동비가 차단 요소', '면제 또는 유예 요청', '리베이트 조건·TGX 승인/라이브 조건 불명확'],
    decisions: ['타당성 전 비용 약정 금지; 성공 연동형 조건 추진'],
    openIssues: ['비용 면제/유예 미승인; 리베이트 조건 미정의'],
    followUps: ['라이브 연동 면제 또는 유예 요청', '리베이트 구조·볼륨 약정 명확화', 'TGX 승인을 전제 조건으로'],
    risks: ['타당성 전 환불불가 비용 지불은 매몰비용 리스크'],
  },
  'mtg-dida-0530': {
    title: 'Dida — 오프라인 정확도 및 매핑 검토',
    aiSummary: 'Dida가 오프라인 정확도 문제를 겪고 있습니다: 룸타입 코드 불일치와 취소 정책 오탐입니다. 공동 리뷰가 필요합니다. 핵심 과제는 Dida 측 잘못된 룸타입 코드와 실제 오마이호텔 매진 사례를 구분해 책임을 정확히 배정하고 올바른 수정을 적용하는 것입니다.',
    keyPoints: ['룸타입 코드 불일치로 오프라인 이슈 발생', '취소 정책 오탐 사례', '잘못된 코드 오류와 실제 매진 구분 필요'],
    decisions: ['공동 매핑·룸타입 검증 리뷰 진행'],
    openIssues: ['잘못된 코드 vs 매진 공유 분류 체계 부재'],
    followUps: ['공동 기술 리뷰 일정', '공유 룸타입 검증 규칙 구축', 'Dida에 수정 일정 전달'],
    risks: ['지속적 매핑 오류로 신뢰 저하 및 이탈 신호'],
  },
  'mtg-traveloka-0606': {
    title: 'Traveloka — 프리북 실패 및 API 모니터링',
    aiSummary: 'Traveloka는 프리북 성공률 기반의 자동 정지 임계치를 운영합니다. "No Room Available" 오류가 증가했습니다. VN·KR·MY·JP 실패율 모니터링이 필요하고 Atlas API 스키마 업데이트가 검토 중입니다. 자동 정지를 피하려면 볼륨 확장 전 실패를 줄여야 합니다.',
    keyPoints: ['프리북 성공률 기반 자동 정지 임계치', '증가한 "No Room Available" 오류', '시장별(VN/KR/MY/JP) 모니터링 필요', 'Atlas API 스키마 업데이트 검토 중'],
    decisions: ['볼륨 확장 전 프리북 실패 감소'],
    openIssues: ['시장별 실패 모니터링 미구축'],
    followUps: ['시장별 프리북 실패 모니터링 구축', '최대 No-Room-Available 원인 우선 처리', 'Atlas API 스키마 검토 완료'],
    risks: ['실패율이 임계치를 넘으면 자동 정지'],
  },
  'mtg-poseidon-0531': {
    title: 'Poseidon — 정책 및 스마트스토어 판매 셋업',
    aiSummary: 'Poseidon의 연령 규정과 취소 정책이 확정됐고 결제는 50% 선결제를 요구합니다. 남은 작업은 현장 결제 처리·노쇼 통제 정렬과 상품 이미지·네이버 스마트스토어 판매 프로세스 명확화입니다.',
    keyPoints: ['연령·취소 정책 확정', '50% 선결제 요구', '현장 결제·노쇼 통제·스마트스토어 프로세스 보류'],
    decisions: ['현장/노쇼 규칙 확정 후 네이버 스마트스토어 등록'],
    openIssues: ['현장 결제·노쇼 통제·상품 이미지 미해결'],
    followUps: ['현장 결제·노쇼 통제 정렬', '상품 이미지 확정', '네이버 스마트스토어 판매 프로세스 명확화'],
    risks: ['현장 결제 시 약한 노쇼 통제는 매출 누수 증가'],
  },
  'mtg-aphrodite-0529': {
    title: 'Aphrodite Yacht — 차터 운영 셋업',
    aiSummary: 'Aphrodite Yacht에 이미 보증금이 납부됐습니다. 운영을 위해 결제 방법·여권 정보 정책·기상 취소 및 환불 규칙·차터 조건·선상 음료 결제 프로세스를 확정해야 합니다. 고가 차터 상품인 만큼 조건을 견고히 정의해야 합니다.',
    keyPoints: ['공급사에 이미 보증금 납부', '결제·여권·기상 취소·차터·음료 조건 미정'],
    decisions: ['상품 출시 전 모든 운영 조건 확정'],
    openIssues: ['결제 방법·여권 정책·기상 환불 규칙 미정의'],
    followUps: ['결제·여권·기상 취소·차터·음료 조건 확정'],
    risks: ['보증금이 이미 납부되어 조건 미정 시 노출 증가'],
  },
  'mtg-chaletkorea-0604': {
    title: 'Chalet Korea — iTANK 연결성 및 공급 범위',
    aiSummary: 'Chalet Korea는 iTANK 연결성과 연계된 후보 파트너입니다. API 연결 가능 여부를 확인하고, 세일즈 잠재력·호텔 공급 범위를 평가하며, 향후 커뮤니케이션을 토대로 채널·공급사·B2B 여부를 판단해야 합니다. 이 공급은 여기어때 CEO 보고 인벤토리 수치에 기여할 수 있습니다.',
    keyPoints: ['연결성은 iTANK 연동에 의존', '세일즈 잠재력·공급 범위 미파악', '관계 유형 미정'],
    decisions: ['iTANK 가능성 확인 후 공급 범위 산정'],
    openIssues: ['API 가능성·공급 범위·관계 유형 미확정'],
    followUps: ['iTANK에 Chalet Korea 연결 가능 여부 확인', '인벤토리·세일즈 잠재력 산정', '공급 확정을 여기어때 CEO 보고에 연결'],
    risks: ['공급 범위가 여기어때 보고의 핵심 경로'],
  },
  'mtg-taiwanhrc-0603': {
    title: 'Taiwan HRC — 연결성 및 상업 범위',
    aiSummary: 'Taiwan HRC는 iTANK 연결성과 연계된 후보 파트너입니다. API 연결 가능 여부를 확인하고 타깃 목적지, 정산 조건(통화·주기), 예상 세일즈 볼륨을 파악해야 합니다. 통화·리포팅이 마찰 요인이 될 수 있습니다.',
    keyPoints: ['연결성은 iTANK 연동에 의존', '타깃 목적지·정산 통화/주기 미파악', '예상 볼륨 미산정'],
    decisions: ['iTANK 가능성 확인 후 상업 세부 수집'],
    openIssues: ['API 가능성·정산 통화·볼륨 미확정'],
    followUps: ['Taiwan HRC iTANK API 가능성 확인', '타깃 목적지·정산·볼륨 추정 수집'],
    risks: ['통화/정산 마찰로 공급 확정 지연 가능'],
  },
}

// ── Emails ─────────────────────────────────────────────────────────────────
interface EmailKo {
  subject: string
  summary: string
  aiIntent: string
  suggestedReply: string
}
export const emailKo: Record<string, EmailKo> = {
  'em-yeogi-1': {
    subject: 'Re: API 연동 — 다음 단계',
    summary: '여기어때가 관심을 확인하고, iTANK가 엔지니어 배정 전 helpdesk@itank.net으로 공식 문의를 요구한다고 전달했습니다.',
    aiIntent: '엔지니어링 차단 해제를 위해 오마이호텔이 iTANK 공식 문의를 보내도록 요청',
    suggestedReply: '이번 주 helpdesk@itank.net으로 공식 문의를 보낼 것임을 확인하고, CEO 보고가 구체적 수치를 제시하도록 한국/일본/베트남 공급 범위를 내부 정렬해 달라고 요청.',
  },
  'em-itank-1': {
    subject: 'API 연결 — 공식 문의 제출 요청',
    summary: 'iTANK가 모든 커뮤니케이션은 helpdesk@itank.net을 통해야 하며, 연결 조건 회신 전 범위·볼륨을 담은 공식 문의가 필요하다고 확인했습니다.',
    aiIntent: '공식 서면 문의를 전제로 엔지니어링 리소스를 통제',
    suggestedReply: '연동 옵션·필요 서류·기술 프로세스·상업 모델·예상 일정·연결 가능 파트너 범위(여기어때·Chalet Korea·Taiwan HRC)를 담은 구조화 문의 발송.',
  },
  'em-grandhyatt-1': {
    subject: '7월 가용성 및 다이렉트 컨트랙트 논의',
    summary: '호텔이 다이렉트 컨트랙트에 열려 있음을 시사하며, 7월 성수기에 대한 오마이호텔의 얼롯먼트 약정과 목표 볼륨을 요청했습니다.',
    aiIntent: '다이렉트 컨트랙트 의향; 대가로 얼롯먼트 약정 희망',
    suggestedReply: '넷 요율·7월 가용성·스위트 요율·얼롯먼트(ALM)·취소 정책·여름 프로모션 조건 요청; 가족/VIP 수요로 다이렉트 조건 정당화.',
  },
  'em-medkorea-1': {
    subject: '협업 — 넷 요율 및 정산 문의',
    summary: 'MKS가 넷 요율 모델과 정산 방식, 램프업 기간 선불 필요 여부를 문의했습니다.',
    aiIntent: '넷 요율 모델·마크업 책임·정산에 대한 명확성 요청',
    suggestedReply: '구조화된 협업 요약 발송: 넷 요율 공급, 고객 측 마크업, 램프업 기간 선불 정산, 보장 예약 흐름, 호텔별 취소/변경 규정.',
  },
  'em-goglobal-1': {
    subject: 'SLA 날인 및 API 라이브 키',
    summary: 'GoGlobal이 날인/인감 상태 확인을 요청하며, 서명 완료 후 API 라이브 키를 발급할 수 있음을 시사했습니다.',
    aiIntent: '날인 확인 시 API 라이브 키 발급 준비 완료',
    suggestedReply: '법인 인감 완료·서명 잔여 여부를 확인한 뒤 API 라이브 키 발급 시점을 명시적으로 문의. 공급 준비를 위해 Sophia 참조.',
  },
  'em-klook-1': {
    subject: 'SLA 초안 — 지원 및 보상',
    summary: 'Klook의 SLA 초안이 24/7 지원과 광범위한 CS 보상 문구를 요구합니다.',
    aiIntent: '24/7 지원 의무와 광범위한 보상 책임을 추진',
    suggestedReply: '실제 06:00–24:00 커버리지와 시간 외 에스컬레이션 경로로 대응하고, 보상을 문서화된 귀속 가능 실패로 한정(법무 검토 보류) 제안.',
  },
  'em-hotelbeds-1': {
    subject: '연동비 — USD 25,000',
    summary: 'Hotelbeds가 USD 25,000 연동비는 환불 불가이며 TGX 진행을 위해 확정을 요청한다고 밝혔습니다.',
    aiIntent: '라이브 전 환불불가 연동비 약정을 요구',
    suggestedReply: '라이브까지 면제 또는 유예 요청, 비용을 볼륨/리베이트 구조에 연동, 약정 전 TGX 승인을 전제 조건으로.',
  },
  'em-dida-1': {
    subject: '오프라인 정확도 — 룸타입·취소 이슈',
    summary: 'Dida가 룸타입 코드 불일치와 취소 정책 오탐을 보고하며 공동 리뷰를 요청했습니다.',
    aiIntent: '오프라인 정확도 이슈 에스컬레이션 및 공동 기술 리뷰 요청',
    suggestedReply: 'Dida 측 잘못된 코드와 실제 매진을 분리하는 공유 룸타입 검증을 구축하기 위한 공동 리뷰와 수정 일정 제안.',
  },
  'em-traveloka-1': {
    subject: '프리북 실패 및 정지 임계치',
    summary: 'Traveloka가 프리북 성공률이 자동 정지 임계치에 근접했음을 경고하며 "No Room Available" 오류를 언급했습니다.',
    aiIntent: '프리북 실패가 자동 채널 정지를 유발할 수 있음을 경고',
    suggestedReply: '확인하고 시장별(VN/KR/MY/JP) 모니터링 계획과 Atlas API 스키마 업데이트 상태 공유; 볼륨 확장 전 실패 감소 약속.',
  },
  'em-webbeds-1': {
    subject: '한국 API 클라이언트 확장 — 프로스펙트',
    summary: 'WebBeds가 한국 API 클라이언트 확장을 제안하며 프로스펙트 후보 리스트를 요청했습니다.',
    aiIntent: '한국 중심 API 클라이언트 확장 파트너십 모색',
    suggestedReply: '한국 우선 30개 프로스펙트 리스트 구축을 제안하고, 개발 리소스 투입 전 JP/VN 경쟁력 검증이 필요함을 언급.',
  },
}

// ── Teams ──────────────────────────────────────────────────────────────────
interface TeamsKo {
  messageSummary: string
  aiExtractedIssue: string
  relatedAction: string
}
export const teamsKo: Record<string, TeamsKo> = {
  'tm-yeogi-1': { messageSummary: 'iTANK가 엔지니어 배정 전 공식 문의를 원함. Chalet Korea·Taiwan HRC가 동일 연동에 포함되는지 확인 필요.', aiExtractedIssue: '공식 iTANK 문의 보류; 1단계 공급 범위 미확정', relatedAction: 'helpdesk@itank.net으로 공식 API 문의 발송' },
  'tm-yeogi-2': { messageSummary: 'Chalet Korea 참여 의향; Taiwan HRC는 정산 통화 명확화 필요. CEO 보고용 요율 시트 준비 가능.', aiExtractedIssue: 'Taiwan HRC 정산 통화 미정; 보고용 요율 시트 필요', relatedAction: 'CEO 보고 인벤토리·요율 시트 준비' },
  'tm-itank-1': { messageSummary: 'iTANK가 helpdesk@itank.net으로 이동시킴. 옵션·서류·프로세스·상업 모델·일정·파트너 범위를 담은 단일 문의 작성 중.', aiExtractedIssue: '공식 문의는 6개 확인 항목을 하나의 이메일에 담아야 함', relatedAction: 'helpdesk@itank.net으로 구조화 문의 작성' },
  'tm-grandhyatt-1': { messageSummary: '그랜드 하얏트 제주 다이렉트 컨트랙트에 열림. 7월 가용성·스위트 요율·ALM·취소 정책·여름 프로모션 필요. 강한 VIP 가족 수요.', aiExtractedIssue: '조건 확정 전 7월 스위트 인벤토리 소진 가능', relatedAction: '넷 요율·ALM·취소 정책·여름 프로모션 요청' },
  'tm-medkorea-1': { messageSummary: 'MKS가 넷 vs 커미션 혼동. 램프업 기간 선불 제안. 보장 예약·호텔별 취소 규정 문서화 필요.', aiExtractedIssue: '넷 요율 모델·정산 구조 서면 미설명', relatedAction: '구조화된 협업·정산 요약 발송' },
  'tm-klook-1': { messageSummary: 'Klook SLA가 24/7 지원 요구 — 우리는 06:00–24:00만 커버. 시간 외 에스컬레이션 경로와 보상 상한으로 대응 중. 법무 검토 필요.', aiExtractedIssue: '24/7+광범위 보상 문구로 과도한 SLA 책임 리스크', relatedAction: '24/7 조항 대응 및 법무와 보상 상한' },
  'tm-hotelbeds-1': { messageSummary: 'Hotelbeds USD 25,000 비용 환불 불가. 라이브·리베이트 연동 면제/유예 요청 중. 타당성 전 약정 금지.', aiExtractedIssue: '타당성 전 환불불가 비용은 매몰비용 리스크', relatedAction: '라이브·리베이트 연동 비용 면제/유예 요청' },
  'tm-dida-1': { messageSummary: 'Dida 오프라인 정확도 이슈 — 룸타입 코드 불일치+취소 오탐. 잘못된 코드와 실제 매진 분리 위해 공동 리뷰 필요.', aiExtractedIssue: 'Dida 측 잘못된 코드와 실제 매진 구분 불가', relatedAction: '공동 매핑·룸타입 검증 리뷰 일정' },
  'tm-dida-2': { messageSummary: '월요일 검증 시작 가능. 마스터 인벤토리 파일과 불일치 예약 목록 전달 요청.', aiExtractedIssue: '매핑팀이 마스터 인벤토리+불일치 예약 목록 필요', relatedAction: '마스터 인벤토리 파일·불일치 예약 목록 전달' },
  'tm-traveloka-1': { messageSummary: 'Traveloka 프리북 성공률이 자동 정지 임계치에 근접. No Room Available 오류 증가. VN/KR/MY/JP 모니터링+Atlas 스키마 검토 필요.', aiExtractedIssue: '프리북 실패율 미감소 시 자동 정지 리스크', relatedAction: '시장별 프리북 실패 모니터링 구축' },
  'tm-goglobal-1': { messageSummary: 'GoGlobal SLA 검토 완료. 인감/서명 상태 확인 및 API 라이브 키 확보 필요. Sophia가 공급 준비 담당.', aiExtractedIssue: '날인/인감 상태 모호; 라이브 키 시점 미파악', relatedAction: '날인 상태 확인 및 라이브 키 요청' },
  'tm-webbeds-1': { messageSummary: 'WebBeds 한국 API 클라이언트 확장 — 개발 우선순위 낮음. 한국 30개 프로스펙트 리스트 구축 중. JP/VN 경쟁력 예상보다 약함.', aiExtractedIssue: '약한 JP/VN 경쟁력으로 리소스 우선순위 결정 보류', relatedAction: '한국 30개 리스트 구축·JP/VN 요율 검증' },
  'tm-poseidon-1': { messageSummary: 'Poseidon 연령+취소 정책 확정, 50% 선결제 필요. 현장 결제+노쇼 통제와 네이버 스마트스토어 판매 프로세스 필요.', aiExtractedIssue: '현장 결제·노쇼 통제 미정의; 스마트스토어 등록 차단', relatedAction: '현장 결제/노쇼 통제·스마트스토어 흐름 정렬' },
  'tm-aphrodite-1': { messageSummary: 'Aphrodite 보증금 이미 납부. 결제 방법·여권 정책·기상 취소 환불·차터 조건·음료 결제 프로세스 여전히 필요.', aiExtractedIssue: '보증금 납부됐으나 운영 조건 미정 — 노출 리스크', relatedAction: '결제·여권·기상·차터 조건 확정' },
  'tm-chaletkorea-1': { messageSummary: 'Chalet Korea가 iTANK 연결성과 연계. API 가능성 확인·공급 범위 산정; 관계 유형(채널/공급사/B2B) 미정.', aiExtractedIssue: '관계 유형 모호; 공급 범위가 여기어때 CEO 보고에 기여', relatedAction: 'iTANK 가능성 확인·Chalet Korea 공급 범위 산정' },
  'tm-taiwanhrc-1': { messageSummary: 'Taiwan HRC가 iTANK 연결성과 연계. API 가능성·타깃 목적지·정산(TWD vs USD)·예상 볼륨 필요.', aiExtractedIssue: '정산 통화 미정; 예상 볼륨 미파악', relatedAction: 'API 가능성 확인·정산/볼륨 수집' },
}
