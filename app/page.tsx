"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  author: string;
  createdAt?: any;
}

export default function Home() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  
  // 뷰 모드 상태: 'mobile' (현장 모바일 뷰) 또는 'admin' (관리자 대시보드)
  const [currentView, setCurrentView] = useState<"mobile" | "admin">("mobile");

  const [activeCategory, setActiveCategory] = useState("전체");
  const [searchTerm, setSearchTerm] = useState("");

  // 새 제안 폼 상태
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("고장정비");
  const [priority, setPriority] = useState("최우선");

  // 데이터 불러오기
  const fetchSuggestions = async () => {
    try {
      const q = query(collection(db, "suggestions"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list: Suggestion[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Suggestion);
      });
      setSuggestions(list);
    } catch (error) {
      console.error("데이터 불러오기 오류:", error);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  // 제안 등록하기
  const handleCreateSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    try {
      await addDoc(collection(db, "suggestions"), {
        title,
        description,
        category,
        priority,
        status: "PENDING",
        author: "최발효 반장 (발효(醱酵))",
        createdAt: Timestamp.now(),
      });
      alert("현장 제안이 성공적으로 등록되었습니다!");
      setTitle("");
      setDescription("");
      setIsNewModalOpen(false);
      fetchSuggestions();
    } catch (error) {
      console.error("등록 오류:", error);
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  // 상태 변경하기
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const docRef = doc(db, "suggestions", id);
      await updateDoc(docRef, { status: newStatus });
      alert(`상태가 [${newStatus}]로 변경되었습니다.`);
      setSelectedSuggestion(null);
      fetchSuggestions();
    } catch (error) {
      console.error("상태 변경 오류:", error);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  // 필터링된 목록
  const filteredSuggestions = suggestions.filter((item) => {
    const matchesCategory = activeCategory === "전체" || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 통계 계산
  const totalCount = suggestions.length;
  const pendingCount = suggestions.filter(s => s.status === "PENDING").length;
  const progressCount = suggestions.filter(s => s.status === "IN_PROGRESS").length;
  const doneCount = suggestions.filter(s => s.status === "DONE").length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* 상단 네비게이션 바 (AI Studio 원본 디자인 적용) */}
      <header className="bg-slate-950 text-white px-6 py-3.5 flex flex-wrap items-center justify-between border-b border-slate-800 shadow-md gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500 text-slate-950 font-black px-3 py-1.5 rounded-xl text-sm tracking-wide shadow">
            술술제안
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm text-slate-100">탁·약주 스마트 제조</h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">현장 27명 스마트 제조</span>
            </div>
            <p className="text-xs text-slate-400">실시간 현장 제안 및 설비 고장정비 통합 관리 시스템</p>
          </div>
        </div>

        {/* 탭 전환 버튼 */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentView("mobile")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              currentView === "mobile" 
                ? "bg-blue-600 text-white shadow" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            📱 현장 모바일 뷰
          </button>
          <button
            onClick={() => setCurrentView("admin")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              currentView === "admin" 
                ? "bg-blue-600 text-white shadow" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            📊 관리자 대시보드
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs bg-slate-900 px-3 py-1.5 rounded-xl text-amber-400 font-medium border border-slate-800">
            👤 로그인: 최발효 반장 (발효(醱酵))
          </span>
          <span className="text-xs bg-emerald-950 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-800 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            온라인 연결
          </span>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        
        {/* 뷰에 따른 화면 분기 */}
        {currentView === "mobile" ? (
          /* ================= 현장 모바일 뷰 ================= */
          <div className="space-y-6">
            {/* 긴급 알림 배너 */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-lg">긴급</span>
                <p className="text-sm font-semibold text-amber-200">긴급 조치 요망 설비 점검 건이 대기 중입니다.</p>
              </div>
              <button 
                onClick={() => setIsNewModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow transition flex items-center gap-2"
              >
                <span>+ 새 제안 / 고장정비 신고하기</span>
              </button>
            </div>

            {/* 카테고리 필터 및 검색 바 */}
            <div className="bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {["전체", "고장정비", "위험성", "공정개선"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                      activeCategory === cat 
                        ? "bg-amber-500 text-slate-950 shadow" 
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="설비명, 제목, 위치 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* 제안 리스트 */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="font-bold text-slate-200 text-lg">
                  현장 제안 리스트 ({filteredSuggestions.length}건)
                </h2>
              </div>

              {filteredSuggestions.length === 0 ? (
                <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800 text-slate-500">
                  등록된 제안이 없습니다. 첫 제안을 등록해 보세요!
                </div>
              ) : (
                filteredSuggestions.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-800 hover:border-amber-500/50 transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-black px-2.5 py-1 rounded-full">
                          {item.priority || "최우선"}
                        </span>
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold px-2.5 py-1 rounded-full">
                          {item.category || "일반"}
                        </span>
                      </div>
                      <div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          item.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          item.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {item.status === 'DONE' ? '완료' : item.status === 'IN_PROGRESS' ? '조치중' : '검토중'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-base">{item.title}</h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-500">
                      <span>작성자: {item.author || "현장 작업자"}</span>
                      <button
                        onClick={() => setSelectedSuggestion(item)}
                        className="text-amber-400 font-bold hover:underline"
                      >
                        상세보기 &rarr;
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* ================= 관리자 대시보드 뷰 ================= */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-400">전체 제안 건수</p>
                <p className="text-3xl font-black text-white mt-2">{totalCount}건</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs font-bold text-amber-400">검토중 (PENDING)</p>
                <p className="text-3xl font-black text-amber-400 mt-2">{pendingCount}건</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs font-bold text-blue-400">조치중 (IN_PROGRESS)</p>
                <p className="text-3xl font-black text-blue-400 mt-2">{progressCount}건</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs font-bold text-emerald-400">완료 (DONE)</p>
                <p className="text-3xl font-black text-emerald-400 mt-2">{doneCount}건</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">관리자 전용 제안 일괄 관리</h3>
              <p className="text-xs text-slate-400">각 제안의 상태를 실시간으로 승인, 조치, 완료 처리할 수 있습니다.</p>
              
              <div className="space-y-3">
                {suggestions.map((item) => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{item.category}</span>
                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-xs font-bold rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PENDING">검토중</option>
                        <option value="IN_PROGRESS">조치중</option>
                        <option value="DONE">완료</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 새 제안 작성 모달 */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <h3 className="text-xl font-extrabold text-white">새 제안 / 고장정비 신고</h3>
            
            <form onSubmit={handleCreateSuggestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">카테고리</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="고장정비">고장정비</option>
                  <option value="위험성">위험성</option>
                  <option value="공정개선">공정개선</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">우선순위</label>
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="최우선">최우선</option>
                  <option value="긴급">긴급</option>
                  <option value="일반">일반</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">제목</label>
                <input
                  type="text"
                  placeholder="예: 메인라인 백세주 라벨러 DC 모터 교체"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">내용</label>
                <textarea
                  rows={4}
                  placeholder="현장 문제점 및 개선 제안 내용을 상세히 입력하세요..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 text-sm shadow-md"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 상세보기 및 상태 변경 모달 */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-extrabold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
                  {selectedSuggestion.category}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2">{selectedSuggestion.title}</h3>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400">제안 내용</span>
              <p className="text-slate-300 bg-slate-950 p-4 rounded-2xl mt-1 text-sm whitespace-pre-wrap leading-relaxed border border-slate-800">
                {selectedSuggestion.description}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 block mb-2">진행 상태 변경 (관리자)</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedSuggestion.id, "PENDING")}
                  className={`py-2.5 rounded-xl text-xs font-bold transition ${
                    selectedSuggestion.status === 'PENDING' 
                      ? 'bg-amber-500 text-slate-950 shadow' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  검토중 (PENDING)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedSuggestion.id, "IN_PROGRESS")}
                  className={`py-2.5 rounded-xl text-xs font-bold transition ${
                    selectedSuggestion.status === 'IN_PROGRESS' 
                      ? 'bg-blue-600 text-white shadow' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  조치중 (IN_PROGRESS)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedSuggestion.id, "DONE")}
                  className={`py-2.5 rounded-xl text-xs font-bold transition ${
                    selectedSuggestion.status === 'DONE' 
                      ? 'bg-emerald-600 text-white shadow' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  완료 (DONE)
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedSuggestion(null)}
                className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 text-sm"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}