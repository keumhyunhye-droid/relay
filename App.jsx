import { useEffect, useRef, useState } from 'react'

const initialMaterials = [
  {
    name: '우드락 3t',
    type: '우드락/폼보드',
    state: '새것',
    loc: 'A1',
    createdAt: '2026-05-01',
  },
]

const categories = [
  '전체',
  '우드락/폼보드',
  '아이소핑크',
  '원단/섬유',
  '금속',
  '플라스틱/아크릴',
  '전시소품',
  '스프레이/본드류',
  '기타',
]

const materialTypes = [
  '우드락/폼보드',
  '아이소핑크',
  '원단/섬유',
  '금속',
  '플라스틱/아크릴',
  '전시소품',
  '스프레이/본드류',
  '기타',
]

const materialIcons = {
  '우드락/폼보드': '/wood.png',
  '아이소핑크': '/pinkfoam.png',
  '원단/섬유': '/fabric.png',
  '금속': '/metal.png',
  '플라스틱/아크릴': '/plastic.png',
  '전시소품': '/display.png',
  '스프레이/본드류': '/spray.png',
  '기타': '/etc.png',
}

const statusOptions = ['새것', '사용함', '잔여분']

const zoneRules = {
  '우드락/폼보드': ['A1', 'A2', 'A3'],
  '플라스틱/아크릴': ['A1', 'A2', 'A3'],
  아이소핑크: ['A4', 'A5'],
  '스프레이/본드류': ['C2', 'C3'],
  default: ['B1', 'B2', 'C1'],
}

function getAvailableZone(type, materials) {
  const zones = zoneRules[type] || zoneRules.default

  const availableZones = zones.filter((zone) => {
    const count = materials.filter((item) => item.loc === zone).length
    return count < 3
  })

  if (availableZones.length === 0) return null

  const randomIndex = Math.floor(Math.random() * availableZones.length)
  return availableZones[randomIndex]
}

function getBarcodeNumber(materials) {
  const used = materials
    .map((item) => item.barcode)
    .filter((num) => typeof num === 'number')

  const available = Array.from({ length: 51 }, (_, i) => i).filter(
    (num) => !used.includes(num)
  )

  if (available.length === 0) return null

  const randomIndex = Math.floor(Math.random() * available.length)
  return available[randomIndex]
}

export default function App() {
  const [page, setPage] = useState('home')
  const [materials, setMaterials] = useState(() => {
    const saved = localStorage.getItem('materials')
  
    return saved
      ? JSON.parse(saved)
      : initialMaterials
  })
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [savedMaterial, setSavedMaterial] = useState(null)
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  const [form, setForm] = useState({
    name: '',
    type: '',
    studentId: '',
    state: '새것',
    description: '',
  })

  const filteredMaterials =
    selectedCategory === '전체'
      ? materials
      : materials.filter((item) => item.type === selectedCategory)

  const scrollRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(
      'materials',
      JSON.stringify(materials)
    )
  }, [materials])

  const handleWheel = (e) => {
    if (scrollRef.current) {
      e.preventDefault()
      scrollRef.current.scrollLeft += e.deltaY
    }
  }

  const handleSubmit = () => {
    if (!form.name || !form.type || !form.state) {
      alert('필수 항목을 입력해줘!')
      return
    }

    const assignedZone = getAvailableZone(form.type, materials)
    const barcode = getBarcodeNumber(materials)

    if (!assignedZone) {
      alert('해당 재료를 보관할 수 있는 구역이 가득 찼어!')
      return
    }

    if (barcode === null) {
      alert('사용 가능한 바코드 번호가 없어!')
      return
    }

    const newMaterial = {
      name: form.name,
      type: form.type,
      state: form.state,
      studentId: form.studentId,
      description: form.description,
      loc: assignedZone,
      barcode,
      createdAt: new Date().toISOString(),
    }

    setMaterials([newMaterial, ...materials])
    setSavedMaterial(newMaterial)

    setForm({
      name: '',
      type: '',
      studentId: '',
      state: '새것',
      description: '',
    })

    setSelectedCategory('전체')
    setPage('savedInfo')
  }
  const handlePickupComplete = (target) => {
    setMaterials((prev) =>
      prev.filter((item) => item !== target)
    )
  
    setSelectedMaterial(null)
    setPage('home')
  }

  return (
    <main className="w-screen h-[100dvh] bg-black overflow-hidden flex items-center justify-center">
  <div
    style={{
      width: 'min(100vw, calc(100dvh * 1668 / 2224))',
      aspectRatio: '1668 / 2224',
    }}
    className="relative bg-[#252525] text-white overflow-hidden"
  >
      {page === 'home' ? (
  <HomePage
    setPage={setPage}
    scrollRef={scrollRef}
    handleWheel={handleWheel}
    materials={filteredMaterials}
    selectedCategory={selectedCategory}
    setSelectedCategory={setSelectedCategory}
    setSelectedMaterial={setSelectedMaterial}
  />

  ) : page === 'registerGuide' ? (
  <RegisterGuidePage setPage={setPage} />
) : page === 'pickupGuide' ? (
  <PickupGuidePage setPage={setPage} />
) : page === 'pickupList' ? (
  <PickupListPage
    setPage={setPage}
    materials={filteredMaterials}
    selectedCategory={selectedCategory}
    setSelectedCategory={setSelectedCategory}
    setSelectedMaterial={setSelectedMaterial}
    scrollRef={scrollRef}
    handleWheel={handleWheel}
  />

) : page === 'savedInfo' ? (
  <SavedInfoPage setPage={setPage} />
) : page === 'barcodeAttach' ? (
  <BarcodeAttachPage
    setPage={setPage}
    savedMaterial={savedMaterial}
  />
) : page === 'scan' ? (
  <ScanPage
    setPage={setPage}
    savedMaterial={savedMaterial}
  />
) : page === 'final' ? (
  <FinalPage
    setPage={setPage}
    savedMaterial={savedMaterial}
  />

) : page === 'register' ? (
  <RegisterPage
    setPage={setPage}
    form={form}
    setForm={setForm}
    handleSubmit={handleSubmit}
  />
) : page === 'success' ? (
  <SuccessPage
    setPage={setPage}
    savedMaterial={savedMaterial}
  />
) : page === 'detail' ? (
  <DetailPage
    setPage={setPage}
    material={selectedMaterial}
  />
) : page === 'pickupScan' ? (
  <PickupScanPage
    setPage={setPage}
    material={selectedMaterial}
    handlePickupComplete={handlePickupComplete}
  />
) : page === 'guide' ? (
  <GuidePage
    setPage={setPage}
  />
) : page === 'scan' ? (
  <ScanPage
    setPage={setPage}
    savedMaterial={savedMaterial}
  />
) : page === 'final' ? (
  <FinalPage
    setPage={setPage}
  />
) : null}
      </div>
    </main>
  )
}

function getDDay(createdAt) {
  const created = new Date(createdAt)
  const today = new Date()

  const diffTime = today - created

  const passedDays = Math.floor(
    diffTime / (1000 * 60 * 60 * 24)
  )

  const remain = 21 - passedDays

  return remain > 0
    ? `D-${remain}`
    : '만료'
}

function HomePage({ setPage }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#303030] text-white">
      <div className="absolute -top-20 -left-24 w-[360px] h-[360px] bg-[#9cff5a]/25 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-90px] right-[-80px] w-[420px] h-[420px] bg-[#9cff5a]/25 blur-[110px] rounded-full" />

      <div className="relative z-10 h-full px-8 pt-16 pb-14 flex flex-col items-center">
        <section className="text-center mt-[70px]">
          <img
            src="/relay-logo.png"
            alt="RELAY"
            className="mx-auto w-[460px] max-w-[88%] h-auto object-contain"
          />

<p className="mt-8 text-[15px] leading-[1.5] text-gray-300 font-medium">
  남는 재료를 등록하고, 필요한 재료를 바로 가져가세요.
  <br />
  Relay는 버려지는 재료를 필요한 사람에게 이어주는
  <br />
  재료 순환 서비스입니다.
</p>

          <button
            type="button"
            onClick={() => setPage('guide')}
            className="mt-5 text-[18px] text-gray-300 font-black underline underline-offset-4"
          >
            이용방법 더보기 ›
          </button>
        </section>

        <div className="mt-auto mb-10 w-full grid grid-cols-2 gap-7">
  <button
    type="button"
    onClick={() => setPage('registerGuide')}
    className="h-[130px] rounded-[20px] bg-[#A9FF70] text-black flex items-center px-5 overflow-hidden shadow-[0_14px_35px_rgba(156,255,90,0.18)]"
  >
    <img
      src="/icon-register.png"
      alt=""
      className="w-[67px] h-[67px] object-contain shrink-0 mr-5"
    />

    <div className="text-left flex-1 min-w-0">
      <p className="text-[29px] font-black leading-none whitespace-nowrap">
        등록하기
      </p>
      <p className="mt-3 text-[13px] font-medium leading-tight">
        남은 재료를 공유해요
      </p>
    </div>
  </button>

  <button
    type="button"
    onClick={() => setPage('pickupGuide')}
    className="h-[130px] rounded-[20px] bg-[#A9FF70] text-black flex items-center px-5 overflow-hidden shadow-[0_14px_35px_rgba(156,255,90,0.18)]"
  >
    <img
      src="/icon-pickup.png"
      alt=""
      className="w-[67px] h-[67px] object-contain shrink-0 mr-5"
    />

    <div className="text-left flex-1 min-w-0">
      <p className="text-[29px] font-black leading-none whitespace-nowrap">
        가져가기
      </p>
      <p className="mt-3 text-[13px] font-medium leading-tight">
        필요 재료를 가져가요
      </p>
    </div>
  </button>
</div>
      </div>
    </div>
  )
}

function RegisterGuidePage({ setPage }) {
  return (
    <div className="relative w-full h-full bg-[#303030] text-white overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-50 bg-[#303030] px-8 pt-8 pb-6">
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => setPage('home')}
            className="absolute left-0 text-[#9cff5a] text-[34px] leading-none"
          >
            ←
          </button>

          <h1 className="text-[#9cff5a] text-[22px] font-black">
            재료 등록하기
          </h1>
        </div>
      </header>

      <div className="h-full overflow-y-auto overflow-x-hidden px-8 pt-[130px] pb-[150px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className=" rounded-[5px] overflow-hidden">
          <img
            src="/guide-register-page.png"
            alt="재료 등록하기 이용방법"
            className="w-full h-auto block"
          />
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 z-50 bg-[#303030] px-8 py-8">
        <button
          type="button"
          onClick={() => setPage('register')}
          className="w-full h-[58px] rounded-full bg-[#9cff5a] text-black text-[23px] font-black shadow-[0_12px_35px_rgba(156,255,90,0.2)]"
        >
          등록하기
        </button>
      </footer>
    </div>
  )
}

function PickupGuidePage({ setPage }) {
  return (
    <div className="relative w-full h-full bg-[#303030] text-white overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-50 bg-[#303030] px-8 pt-8 pb-6">
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => setPage('home')}
            className="absolute left-0 text-[#9cff5a] text-[34px] leading-none"
          >
            ←
          </button>

          <h1 className="text-[#9cff5a] text-[22px] font-black">
            재료 가져가기
          </h1>
        </div>
      </header>

      <div className="h-full overflow-y-auto overflow-x-hidden px-8 pt-[130px] pb-[150px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className=" rounded-[5px] overflow-hidden">
          <img
            src="/guide-pickup-page.png"
            alt="재료 가져가기 이용방법"
            className="w-full h-auto block"
          />
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 z-50 bg-[#303030] px-8 py-8">
        <button
          type="button"
          onClick={() => setPage('pickupList')}
          className="w-full h-[58px] rounded-full bg-[#9cff5a] text-black text-[23px] font-black shadow-[0_12px_35px_rgba(156,255,90,0.2)]"
        >
          가져가기
        </button>
      </footer>
    </div>
  )
}

function PickupListPage({
  setPage,
  materials,
  selectedCategory,
  setSelectedCategory,
  setSelectedMaterial,
  scrollRef,
  handleWheel,
}) {
  return (
    <div className="relative w-full h-full bg-[#303030] text-white overflow-hidden">
      {/* 상단 헤더 */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-[#303030] px-8 pt-8 pb-6">
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => setPage('home')}
            className="absolute left-0 text-[#9cff5a] text-[34px] leading-none"
          >
            ←
          </button>

          <h1 className="text-[#9cff5a] text-[22px] font-black">
            재료 가져가기
          </h1>
        </div>
      </header>

      {/* 고정 영역: 개수 + 카테고리 */}
      <section className="absolute top-[105px] left-0 right-0 z-40 bg-[#303030] px-8 pb-7">
        <div className="flex items-end gap-3">
          <h2 className="text-[19px] font-black">
            현재 보관중인 재료
          </h2>

          <p className="text-[#9cff5a] text-[32px] leading-none font-black">
            {materials.length}
            <span className="text-[17px] ml-1 text-white">건</span>
          </p>
        </div>

        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="mt-7 -mx-8 px-8 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="flex w-max gap-3">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 h-[42px] px-5 rounded-full font-black text-[15px] ${
                  selectedCategory === cat
                    ? 'bg-[#9cff5a] text-black'
                    : 'bg-[#bfbfbf] text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 스크롤 영역: 재료 카드만 */}
      <div className="absolute top-[265px] bottom-0 left-0 right-0 overflow-y-auto overflow-x-hidden px-8 pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-4">
          {materials.map((item, index) => {
            const createdAt = item.created_at || item.createdAt
            const remainDays = createdAt ? getRemainDays(createdAt) : 21

            return (
              <article
                key={item.id || index}
                onClick={() => {
                  setSelectedMaterial(item)
                  setPage('detail')
                }}
                className="bg-white text-black rounded-[18px] px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-[20px] leading-none font-black">
                    {item.name}
                  </h3>

                  <p className="mt-3 text-[13px] font-bold text-gray-400">
                    {item.type}
                    <span className="mx-2">•</span>
                    <span className="text-emerald-600">{item.state}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    {item.loc}
                  </p>
                </div>

                <div className="flex items-center gap-2 font-black text-[18px]">
                  <span
                    className={
                      remainDays <= 1
                        ? 'text-red-500'
                        : remainDays <= 3
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }
                  >
                    {createdAt ? getDDay(createdAt) : item.day || 'D-21'}
                  </span>

                  <span className="text-gray-300 text-[24px] leading-none">
                    ›
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      {/* 하단 그라데이션 */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[180px] bg-gradient-to-t from-[#303030] via-[#303030]/85 to-transparent z-30" />
    </div>
  )
}

function formatDate(date) {
  const d = new Date(date)

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

function getExpireDate(createdAt) {
  const created = new Date(createdAt)
  const expire = new Date(created)

  expire.setDate(created.getDate() + 21)

  return expire
}


function getRemainDays(createdAt) {
  const created = new Date(createdAt)
  const today = new Date()

  const diffTime = today - created

  const passedDays = Math.floor(
    diffTime / (1000 * 60 * 60 * 24)
  )

  return 21 - passedDays
}

function RegisterPage({ setPage, form, setForm, handleSubmit }) {

  const stateIconMap = {
    새것: {
      active: '/icon-new-green.png',
      inactive: '/icon-new-gray.png',
    },
    사용함: {
      active: '/icon-used-green.png',
      inactive: '/icon-used-gray.png',
    },
    잔여분: {
      active: '/icon-leftover-green.png',
      inactive: '/icon-leftover-gray.png',
    },
  }
  return (
    <div className="relative w-full h-full bg-[#303030] overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-50 bg-[#303030] px-8 pt-8 pb-6">
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => setPage('home')}
            className="absolute left-0 text-[#9cff5a] text-[34px] leading-none"
          >
            ←
          </button>
          <h1 className="text-[#9cff5a] text-[20px] font-black">재료 등록</h1>
        </div>
      </header>

      <div className="h-full overflow-y-auto overflow-x-hidden px-8 pt-[120px] pb-[145px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Label text="재료 명 *" />
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="예: 아이소핑크 보드 20T"
          className="mt-2 w-full h-[52px] rounded-[14px] bg-white px-5 text-[17px] text-black placeholder:text-gray-300 outline-none"
        />

        <div className="mt-8">
          <Label text="재료 종류 *" />
          <div className="mt-3 grid grid-cols-4 gap-2">
          {materialTypes.map((type) => (
  <button
    key={type}
    onClick={() => setForm({ ...form, type })}
    className={`h-[82px] rounded-[12px] bg-white text-black font-black flex flex-col items-center justify-center gap-2 ${
      form.type === type ? 'ring-2 ring-[#9cff5a] bg-[#efffe8]' : ''
    }`}
  >
    <img
      src={materialIcons[type]}
      alt=""
      className="w-[45px] h-[45px] object-contain opacity-90"
    />

    <span className="text-[12px]">
      {type}
    </span>
  </button>
))}
          </div>
        </div>

        <div className="mt-7">
          <Label text="학번" />
          <input
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            placeholder="2026XXXXX"
            className="mt-2 w-full h-[52px] rounded-[14px] bg-white px-5 text-[17px] text-black placeholder:text-gray-400 outline-none"
          />
        </div>

        <div className="mt-7">
          <Label text="상태 *" />
          <div className="mt-3 grid grid-cols-3 gap-3">
          {statusOptions.map((state) => (
  <button
    type="button"
    key={state}
    onClick={() => setForm({ ...form, state })}
    className={`h-[110px] rounded-[12px] font-black flex flex-col items-center justify-center ${
      form.state === state
        ? 'bg-[#f2fff2] text-[#4ed64a] border-2 border-[#9cff5a]'
        : 'bg-white text-black'
    }`}
  >
    <img
  src={
    form.state === state
      ? stateIconMap[state].active
      : stateIconMap[state].inactive
  }
  alt=""
  className="w-[30px] h-[30px] object-contain"
/>
    <span
      className={`text-[17px] mt-2 ${
        form.state === state ? 'text-[#4ed64a]' : 'text-black'
      }`}
    >
      {state}
    </span>

    <span
      className={`text-[12px] mt-1 ${
        form.state === state ? 'text-[#63db62]' : 'text-gray-300'
      }`}
    >
      {state === '새것'
        ? '미개봉 / 미사용'
        : state === '사용함'
        ? '일부 사용 (50%이상 남음)'
        : '많이 사용 (50%미만 남음)'}
    </span>
  </button>
))}
          </div>
        </div>

        <div className="mt-7">
          <Label text="상태 설명" />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="두께, 사이즈 등 재료 상태를 간단히 설명해주세요."
            className="mt-2 w-full h-[96px] rounded-[14px] bg-white px-5 py-4 text-[16px] text-black placeholder:text-gray-300 outline-none resize-none"
          />
        </div>

        <div className="mt-7 bg-[#ddffd0] rounded-[14px] p-5 text-[#00864b]">
          <p className="font-black text-[15px]">ⓘ &nbsp; 보관 기간 안내</p>
          <p className="mt-2 text-[14px]">
            재료는 <b>3주 후</b>에 자동 폐기돼요.
          </p>
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 z-50 bg-[#303030] px-8 py-8 border-t border-black/10">
        <button
          onClick={handleSubmit}
          className="w-full h-[58px] rounded-full bg-[#9cff5a] text-black text-[23px] font-black shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
        >
          등록하기
        </button>
      </footer>
    </div>
  )
}

function SavedInfoPage({ setPage }) {
  return (
    <div className="relative w-full h-full bg-[#303030] text-white flex flex-col items-center justify-center px-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
        <div className="w-[80px] h-[80px] rounded-full border-[4px] border-[#9cff5a] flex items-center justify-center text-[#9cff5a] text-[48px]">
          ✓
        </div>

        <h1 className="mt-5 text-[#9cff5a] text-[30px] font-bold">
          재료 정보가 저장됐어요
        </h1>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-8 pb-15 pt-8 border-t border-black/10 bg-[#303030]">
        <button
          type="button"
          onClick={() => setPage('barcodeAttach')}
          className="w-full h-[64px] rounded-full bg-[#9cff5a] text-black text-[22px] font-black shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
        >
          다음 단계
        </button>
      </div>
    </div>
  )
}


function StorageMap({ zone }) {
  const isActive = (z) => zone === z

  const boxClass = (z) =>
    `absolute rounded-[8px] border-2 flex items-center justify-center text-[16px] ${
      isActive(z)
        ? 'bg-[#ddffd0] border-[#54c878] text-[#00864b] font-black'
        : 'border-gray-300 text-gray-400'
    }`

  return (
    <div className="flex-1 h-[280px] relative overflow-visible">
      <div className="absolute top-0 left-[0px] w-[320px] h-[270px]">
      <div
  className={boxClass('C2')}
  style={{ top: 0, left: 12, width: 110, height: 54 }}
>
  C2
</div>

<div
  className={boxClass('C3')}
  style={{ top: 0, left: 132, width: 110, height: 54 }}
>
  C3
</div>

<div
  className={boxClass('C1')}
  style={{ top: 64, left: 12, width: 230, height: 58 }}
>
  C1
</div>

        {['A1', 'A2', 'A3', 'A4', 'A5'].map((z, i) => (
          <div
            key={z}
            className={boxClass(z)}
            style={{
              top: 132,
              left: 11+ i * 34,
              width: 28,
              height: 145,
            }}
          >
            {z}
          </div>
        ))}

<div className={boxClass('B1')} style={{ top: 132, left: 185, width: 58, height: 62 }}>
          B1
        </div>

        <div className={boxClass('B2')} style={{ top: 202, left: 185, width: 58, height: 74 }}>
          B2
        </div>
      </div>
    </div>
  )
}

function BarcodeAttachPage({ setPage, savedMaterial }) {
  const barcode = savedMaterial?.barcode ?? 21

  return (
    <div className="relative w-full h-full bg-[#303030] text-white overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-50 bg-[#303030] px-8 pt-8 pb-6">
        <div className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => setPage('savedInfo')}
            className="absolute left-0 text-[#9cff5a] text-[34px] leading-none"
          >
            ←
          </button>

          <h1 className="text-[#9cff5a] text-[22px] font-black">
            바코드 부착
          </h1>
        </div>
      </header>

      <div className="h-full overflow-y-auto overflow-x-hidden px-8 pt-[120px] pb-15 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mx-auto w-[88%] rounded-[22px] bg-[#d8d8d8] overflow-hidden">
          <img
            src="/register-barcode-attach.png"
            alt="바코드 부착 안내"
            className="w-full h-auto block"
          />
        </div>

        <section className="mt-7 mx-auto w-[88%] bg-white rounded-[22px] px-7 py-7 text-center text-black shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
          <p className="text-[18px] leading-[1.6] text-[#555] font-semibold">
            아래 서랍에서 해당하는 번호의 바코드를
            <br />
            물건의 오른쪽 상단에 부착해주세요.
          </p>

          <p className="mt-5 text-[64px] leading-none font-black text-[#00864b]">
            {barcode}
          </p>

          <p className="mt-7 text-[14px] leading-[1.5] text-[#999]">
            *스프레이 등 원기둥 형태의 물건은 
            평평한 곳에 부착해 주세요
          </p>
        </section>

        <button
          type="button"
          onClick={() => setPage('scan')}
          className="mt-10 w-full h-[64px] rounded-full bg-[#9cff5a] text-black text-[22px] font-black shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
        >
          다음 단계
        </button>
      </div>
    </div>
  )
}

function ScanPage({ setPage, savedMaterial }) {
  const [scanValue, setScanValue] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [showWrongBarcode, setShowWrongBarcode] = useState(false)
  const [wrongValue, setWrongValue] = useState('')
  const scanBuffer = useRef('')

  const barcode = savedMaterial?.barcode ?? 21

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showWrongBarcode) return

      if (e.key === 'Enter') {
        const scanned = scanBuffer.current.trim()
        const targetBarcode = String(barcode)

        if (scanned === targetBarcode) {
          setPage('final')
        } else {
          setWrongValue(scanned)
          setShowWrongBarcode(true)
        }

        scanBuffer.current = ''
        setScanValue('')
        return
      }

      if (/^[0-9]$/.test(e.key)) {
        scanBuffer.current += e.key
        setScanValue(scanBuffer.current)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [barcode, setPage, showWrongBarcode])

  return (
    <div className="relative w-full h-full bg-[#303030] text-white overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-50 bg-[#303030] px-8 pt-8 pb-6">
        <div className="relative flex items-center justify-center">
          <h1 className="text-[#9cff5a] text-[22px] font-black">
            바코드 스캔
          </h1>

          <button
            type="button"
            onClick={() => setPage('barcodeAttach')}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full bg-white/20 text-white text-[34px] flex items-center justify-center"
          >
            ×
          </button>
        </div>
      </header>

      <main className="absolute top-[125px] bottom-0 left-0 right-0 px-8 flex flex-col items-center overflow-hidden">
        <img
          src="/register-barcode-scan.png"
          alt="바코드 스캔 안내"
          className="w-[76%] h-auto block rounded-[24px]"
        />

        <div className="mt-8 flex items-center justify-center gap-2 text-[20px] font-black text-white/55">
          <span className="w-[14px] h-[14px] rounded-full bg-[#84c260]" />
          <span>바코드 번호 {scanValue || barcode}</span>
        </div>

        <div className="relative mt-auto mb-14 flex flex-col items-center">
          {showHelp && (
            <div className="absolute bottom-[46px] left-1/2 -translate-x-1/2 w-[390px] rounded-[14px] bg-white text-black px-6 py-5 shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
              <p className="text-[15px] font-black">
                스캔이 안되나요?
              </p>

              <p className="mt-4 text-[13px] leading-[1.7] text-[#777] font-medium">
                만약 스캔이 안된다면 바코드를 살짝 떼어
                평평하게 만든 후에 다시 찍어주세요.
              </p>
            </div>
          )}

          <button
            type="button"
            className="underline text-[18px] text-[#d9d9d9]"
            onClick={() => setShowHelp((prev) => !prev)}
          >
            스캔이 안 되나요?
          </button>
        </div>
      </main>

      {showWrongBarcode && (
  <div
    onClick={() => {
      setShowWrongBarcode(false)
      setWrongValue('')
    }}
    className="absolute inset-0 z-[100] bg-black/70 flex items-center justify-center px-8"
  >
    <div
      className="w-[340px] rounded-[24px] bg-white text-black px-6 py-8 text-center shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
    >
      <div className="mx-auto w-[65px] h-[65px] rounded-full bg-[#fff7df] flex items-center justify-center">
      <span className="text-[34px] text-[#f2a20c] -mt-[15px] leading-none">
  ⚠
</span>
      </div>

      <h2 className="mt-5 text-[20px] font-black">
        할당된 바코드가 아니에요.
      </h2>

      <p className="mt-1 text-[14px] leading-[1.6] text-[#8b8b8b] font-medium">
        번호를 확인하고 다시 부착해주세요.
      </p>

      <p className="mt-3 text-[44px] leading-none font-black text-[#00864b]">
        {barcode}
      </p>
    </div>
  </div>
)}
    </div>
  )
}

function CompactStorageMap({ zone }) {
  const isActive = (z) => zone === z

  const boxClass = (z) =>
    `absolute rounded-[8px] border-[2px] flex items-center justify-center text-[18px] font-bold ${
      isActive(z)
        ? 'bg-[#ddffd0] border-[#61c97a] text-[#208c3d] font-black'
        : 'bg-white border-gray-300 text-gray-400'
    }`

  return (
    <div className="relative w-[360px] h-[360px] shrink-0">
      {/* C2 / C3 */}
      <div
        className={boxClass('C2')}
        style={{ top: 0, left: 0, width: 132, height: 74 }}
      >
        C2
      </div>

      <div
        className={boxClass('C3')}
        style={{ top: 0, left: 142, width: 132, height: 74 }}
      >
        C3
      </div>

      {/* C1 */}
      <div
        className={boxClass('C1')}
        style={{ top: 84, left: 0, width: 274, height: 70 }}
      >
        C1
      </div>

      {/* A1~A5 */}
      {['A1', 'A2', 'A3', 'A4', 'A5'].map((z, i) => (
        <div
          key={z}
          className={boxClass(z)}
          style={{
            top: 164,
            left: i * 38,
            width: 30,
            height: 170,
          }}
        >
          {z}
        </div>
      ))}

      {/* B1 / B2 */}
      <div
        className={boxClass('B1')}
        style={{ top: 164, left: 193, width: 82, height: 80 }}
      >
        B1
      </div>

      <div
        className={boxClass('B2')}
        style={{ top: 253, left: 193, width: 82, height: 80 }}
      >
        B2
      </div>
    </div>
  )
}

function FinalPage({ setPage, savedMaterial }) {
  const zone = savedMaterial?.loc || 'A3'

  return (
    <div className="relative w-full h-full bg-[#303030] text-white overflow-hidden px-8">
      <section className="pt-[32px] text-center">
  <div className="mx-auto w-[58px] h-[58px] rounded-full border-[4px] border-[#9cff5a] flex items-center justify-center text-[#9cff5a] text-[32px] leading-none">
    ✓
  </div>

  <h1 className="mt-4 text-[#9cff5a] text-[32px] font-black leading-none">
    등록 완료!
  </h1>

  <p className="mt-5 text-[16px] leading-[1.5] text-white/70 font-medium">
    재료가 목록에 공개됐어요.
    <br />
    이제 재료를 보관함에 넣어주세요.
  </p>
</section>

      <section className="mt-[24px] w-[98%] mx-auto h-[370px] bg-white rounded-[24px] px-7 py-4 text-black overflow-hidden">
        <div className="flex items-start justify-between gap-5">
          <div className="w-[160px] shrink-0">
            <p className="mt-4 text-[20px] leading-[1.25] font-black text-[#555] whitespace-nowrap">
              배정된 수납공간 번호
            </p>

            <p className="mt-7 text-[62px] font-black text-[#00864b] leading-none">
              {zone}
            </p>

            <p className="mt-7 text-[19px] leading-[1.45] text-[#666]">
              아래 수납공간에
              <br />
              재료를 넣어주세요
            </p>
          </div>

          <div className=" shrink-0 scale-90 origin-center ml-6">
  <CompactStorageMap zone={zone} />
</div>
        </div>
      </section>

      <footer className="absolute bottom-0 left-0 right-0 px-8 pb-8 pt-5 bg-[#303030]">
        <button
          type="button"
          onClick={() => setPage('home')}
          className="w-full h-[60px] rounded-full bg-[#9cff5a] text-black text-[21px] font-black shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
        >
          홈으로 돌아가기
        </button>

        <button
          type="button"
          onClick={() => setPage('registerGuide')}
          className="mt-4 w-full h-[60px] rounded-full bg-white text-black text-[21px] font-black"
        >
          재료 하나 더 등록
        </button>
      </footer>
    </div>
  )
}

function DetailPage({ setPage, material }) {
  const item = material || {
    name: '사용 흔적 없는 아이소핑크 보드 50t',
    type: '아이소핑크',
    state: '새것',
    loc: 'A3',
    barcode: 21,
    studentId: '2026XXXXX',
    day: 'D-22',
    description: '과제 후 남은 미사용 보드. 한쪽 모서리에 약간의 흠집 있음',
  }
  const startDate = item.createdAt
  ? formatDate(item.createdAt)
  : '등록일 없음'

const endDate = item.createdAt
  ? formatDate(getExpireDate(item.createdAt))
  : '만료일 없음'

const dDay = item.createdAt
  ? getDDay(item.createdAt)
  : item.day || 'D-21'
  return (
    <div className="relative w-full h-full bg-[#303030] text-white overflow-hidden">

      {/* 스크롤 되는 본문 */}
      <div className="h-full overflow-y-auto overflow-x-hidden px-8 pt-8 pb-[150px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

  <header className="relative flex items-center justify-center mb-10">
    <button
      onClick={() => setPage('home')}
      className="absolute left-0 text-[#9cff5a] text-[34px] leading-none"
    >
      ←
    </button>

    <h2 className="text-[#9cff5a] text-[20px] font-black">
      재료 상세
    </h2>
  </header>

  <h1 className="text-[#9cff5a] text-[28px] font-black leading-tight">
    {item.name}
  </h1>

        

        <div className="mt-6 flex gap-3">
          {[item.type, item.state, item.loc].map((tag) => (
            <span
              key={tag}
              className="px-4 h-[32px] rounded-full border border-[#9cff5a] text-[#9cff5a] text-[14px] font-black flex items-center"
            >
              {tag}
            </span>
          ))}
        </div>

        <section className="mt-7 space-y-6 text-[16px]">
          <InfoRow
            label="상태 설명"
            value={item.description || '등록된 설명이 없습니다'}
          />

          <InfoRow
            label="등록자"
            value={item.studentId || '학번 정보 없음'}
          />

<InfoRow
  label="보관 기간"
  value={`${startDate} ~ ${endDate} (${dDay})`}
/>
        </section>

        <div className="mt-7 border-t border-white/15" />

        <section className="mt-8 flex items-start gap-6">
  <div className="w-[150px] shrink-0">
    <p className="text-[22px] font-black text-white/60">
      보관 위치
    </p>

    <p className="mt-5 text-[#9cff5a] text-[44px] font-black leading-none">
      {item.loc}
    </p>

    <p className="mt-8 text-[22px] font-black text-white/60">
      바코드 번호
    </p>

    <p className="mt-5 text-[#9cff5a] text-[44px] font-black leading-none">
      {item.barcode ?? 21}
    </p>
  </div>

  <div className="flex-1 flex justify-end pr-20 overflow-visible">
    <DarkStorageMap zone={item.loc} />
  </div>
</section>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 pt-6 bg-[#303030] z-50">
        <button
          onClick={() => setPage('pickupScan')}
          className="w-full h-[64px] rounded-full bg-[#9cff5a] text-black text-[20px] font-black"
        >
          재료 가져가기
        </button>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-5">
      <p className="text-white/45 font-black">{label}</p>
      <p className="text-white/80">{value}</p>
    </div>
  )
}

function DarkStorageMap({ zone }) {
  const isActive = (z) => zone === z

  const boxClass = (z) =>
    `absolute rounded-[7px] flex items-center justify-center text-[16px] ${
      isActive(z)
        ? 'bg-[#ddffd0] text-[#1f9a55] font-black'
        : 'bg-[#8a8a88] text-white/70'
    }`

  return (
    <div className="relative w-[500px] h-[420px] shrink-0 origin-top-right translate-x-23 scale-120">
      <div className={boxClass('C2')} style={{ top: 0, left: 40, width: 118, height: 58 }}>C2</div>
      <div className={boxClass('C3')} style={{ top: 0, left: 166, width: 118, height: 58 }}>C3</div>
      <div className={boxClass('C1')} style={{ top: 66, left: 40, width: 244, height: 58 }}>C1</div>

      {['A1', 'A2', 'A3', 'A4', 'A5'].map((z, i) => (
        <div
          key={z}
          className={boxClass(z)}
          style={{ top: 136, left: 40+ i * 35, width: 28, height: 170 }}
        >
          {z}
        </div>
      ))}

      <div className={boxClass('B1')} style={{ top: 136, left: 216, width: 68, height: 92 }}>B1</div>
      <div className={boxClass('B2')} style={{ top: 236, left: 216, width: 68, height: 70 }}>B2</div>
    </div>
  )
}
function PickupScanPage({ setPage, material, handlePickupComplete }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showDone, setShowDone] = useState(false)
  const [scanValue, setScanValue] = useState('')
  const scanBuffer = useRef('')
  const [showWrongBarcode, setShowWrongBarcode] = useState(false)

  const item = material || {
    name: '아이소핑크 보드 A2',
    loc: 'A3',
    barcode: 21,
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showConfirm || showDone || showWrongBarcode) return

      if (e.key === 'Enter') {
        const scanned = scanBuffer.current.trim()
        const targetBarcode = String(item.barcode ?? '')

        if (scanned === targetBarcode) {
          setShowConfirm(true)
        } else {
          setShowWrongBarcode(true)
        }

        scanBuffer.current = ''
        setScanValue('')
        return
      }

      if (/^[0-9]$/.test(e.key)) {
        scanBuffer.current += e.key
        setScanValue(scanBuffer.current)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [item.barcode, showConfirm, showDone])

  return (
    <div className="relative w-full h-full bg-[#303030] text-white overflow-hidden">
      {/* 상단 헤더 */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-[#303030] px-8 pt-8 pb-6">
        <div className="relative flex items-center justify-center">
          <h1 className="text-[#9cff5a] text-[22px] font-black">
            바코드 스캔
          </h1>

          <button
            type="button"
            onClick={() => setPage('detail')}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full bg-white/20 text-white text-[34px] flex items-center justify-center"
          >
            <span className="-mt-[4px]">×</span>
          </button>
        </div>
      </header>

      {/* 스캔 안내 화면 */}
      <main className="absolute top-[125px] bottom-0 left-0 right-0 px-8 flex flex-col items-center overflow-hidden">
        <img
          src="pickup-barcode-scan.png"
          alt="수령 바코드 스캔 안내"
          className="w-[76%] h-auto block rounded-[24px]"
        />

        <div className="mt-8 flex items-center justify-center gap-2 text-[20px] font-black text-white/55">
          <span className="w-[14px] h-[14px] rounded-full bg-[#84c260]" />
          <span>
            바코드 번호 {scanValue || item.barcode || '-'} · 보관구역 {item.loc}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="mt-auto mb-14 underline text-[18px] text-[#d9d9d9]"
        >
          테스트용으로 수령하기
        </button>
      </main>

      {showWrongBarcode && (
  <div
    onClick={() => setShowWrongBarcode(false)}
    className="absolute inset-0 z-[100] bg-black/70 flex items-center justify-center px-8"
  >
    <div className="w-[340px] rounded-[24px] bg-white text-black px-6 py-8 text-center shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
      <div className="mx-auto w-[62px] h-[62px] rounded-full bg-[#fff7df] flex items-center justify-center overflow-hidden">
        <span className="text-[34px] text-[#f2a20c] -mt-[15px] leading-none">
          ⚠
        </span>
      </div>

      <h2 className="mt-5 text-[18px] font-black">
        해당 재료의 바코드가 아니에요.
      </h2>

      <p className="mt-2 text-[14px] leading-[1.6] text-[#8b8b8b] font-medium">
        번호를 확인하고 다시 스캔해주세요.
      </p>

      <p className="mt-3 text-[44px] leading-none font-black text-[#00864b]">
        {item.barcode}
      </p>
    </div>
  </div>
)}

      {/* 기존 확인 팝업: 건드리지 않음 */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[350px] max-h-[300px] rounded-[28px] bg-[#f5f5f5] overflow-hidden"
          >
            <div className="px-6 pt-2 pb-2 flex flex-col items-center">
              <div className="w-[56px] h-[56px] flex items-center justify-center text-[42px]">
                ⚠️
              </div>

              <h2 className="mt-2 text-[20px] font-black text-black">
                수령 완료하시겠습니까?
              </h2>

              <p className="mt-2 text-center text-[13px] leading-[18px] text-[#9a9a9a]">
                확인 후에는 취소가 불가능합니다.
                <br />
                재료를 확실히 수령한 경우에만 눌러주세요.
              </p>

              <div className="mt-3 w-full rounded-[14px] bg-[#eceae7] px-4 py-3">
                <p className="text-[16px] font-black text-black">
                  {item.name}
                </p>

                <p className="mt-1 text-[14px] text-[#8d8d8d]">
                  구역 {item.loc} · 바코드 {item.barcode}
                </p>
              </div>
            </div>

            <div className="border-t border-black/10 flex">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-[50px] text-[18px] font-black text-[#9a9a9a]"
              >
                취소
              </button>

              <div className="w-px bg-black/10" />

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowConfirm(false)
                  setShowDone(true)
                }}
                className="flex-1 h-[56px] text-[18px] font-black text-[#11a36c]"
              >
                수령 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 기존 완료 팝업: 건드리지 않음 */}
      {showDone && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="w-[320px] rounded-[28px] bg-[#f5f5f5] px-6 pt-8 pb-6 flex flex-col items-center">
            <div
              className="w-[72px] h-[72px] rounded-full
              bg-[#d8efc7] flex items-center justify-center
              text-[40px] text-[#2fb673] shadow"
            >
              ✓
            </div>

            <h2 className="mt-5 text-[24px] font-black text-black">
              수령 완료!
            </h2>

            <p className="mt-3 text-center text-[14px] leading-[24px] text-[#9a9a9a]">
              {item.name}를 수령했어요.
              <br />
              목록에서 해당 재료가 제거됩니다.
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePickupComplete(item)
              }}
              className="mt-7 w-full h-[56px] rounded-[18px]
              bg-[#31bb78] text-white text-[20px] font-black"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
function GuidePage({ setPage }) {
  const [guideMode, setGuideMode] = useState('menu')

  if (guideMode === 'menu') {
    return (
      <div className="relative w-full h-full bg-[#2d2d2d] text-white overflow-hidden px-8 pt-8">
        <div className="absolute -top-20 -left-24 w-[280px] h-[280px] bg-[#9cff5a]/20 blur-[85px] rounded-full" />

        <header className="relative z-10 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setPage('home')}
            className="absolute left-0 text-[#9cff5a] text-[28px] leading-none"
          >
            ←
          </button>

          <h1 className="text-[#9cff5a] text-[22px] font-black">
            이용방법
          </h1>
        </header>

        <section className="relative z-10 h-full flex flex-col items-center justify-center pb-12">
        <img
  src="/relay-logo.png"
  alt="RELAY"
  className="mx-auto w-[520px] max-w-[80%] h-auto object-contain"
/>

          <div className="mt-[150px] w-full space-y-7">
            <button
              type="button"
              onClick={() => setGuideMode('register')}
              className="w-full h-[84px] rounded-full bg-[#9cff5a] text-black text-[28px] font-black shadow-[0_12px_35px_rgba(156,255,90,0.22)]"
            >
              재료 등록하기
            </button>

            <button
              type="button"
              onClick={() => setGuideMode('pickup')}
              className="w-full h-[84px] rounded-full bg-[#9cff5a] text-black text-[28px] font-black shadow-[0_12px_35px_rgba(156,255,90,0.22)]"
            >
              재료 가져가기
            </button>
          </div>
        </section>
      </div>
    )
  }

  if (guideMode === 'pickup') {
    return (
      <div className="relative w-full h-full bg-[#2d2d2d] text-white overflow-y-auto overflow-x-hidden px-8 pt-8 pb-12 [&::-webkit-scrollbar]:hidden">
        <header className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => setGuideMode('menu')}
            className="absolute left-0 text-[#9cff5a] text-[28px] leading-none"
          >
            ←
          </button>

          <h1 className="text-[#9cff5a] text-[22px] font-black">
            재료 가져가기
          </h1>
        </header>

        <section className="mt-[90px] bg-white rounded-[24px] overflow-hidden p-3">
          <img
            src="/guide-pickup.png"
            alt="재료 가져가기 이용방법"
            className="w-full h-auto block"
          />
        </section>
      </div>
    )
  }

  if (guideMode === 'register') {
    return (
      <div className="relative w-full h-full bg-[#2d2d2d] text-white overflow-y-auto overflow-x-hidden px-8 pt-8 pb-12 [&::-webkit-scrollbar]:hidden">
        <header className="relative flex items-center justify-center">
          <button
            type="button"
            onClick={() => setGuideMode('menu')}
            className="absolute left-0 text-[#9cff5a] text-[28px] leading-none"
          >
            ←
          </button>

          <h1 className="text-[#9cff5a] text-[22px] font-black">
            재료 등록하기
          </h1>
        </header>

        <section className="mt-[90px] bg-white rounded-[24px] overflow-hidden p-3">
          <img
            src="/guide-register.png"
            alt="재료 등록하기 이용방법"
            className="w-full h-auto block"
          />
        </section>
      </div>
    )
  }
}

function Label({ text }) {
  return (
    <p className="text-white text-[15px] font-black">
      {text.includes('*') ? (
        <>
          {text.replace(' *', '')} <span className="text-[#9cff5a]">*</span>
        </>
      ) : (
        text
      )}
    </p>
  )
}