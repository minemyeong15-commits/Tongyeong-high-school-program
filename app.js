const DEMO_LOST = [
  {id:1,name:"검은색 우산",place:"본관 2층 복도",date:"2026-08-14",reporter:"학생",image:null},
  {id:2,name:"파란색 필통",place:"도서관",date:"2026-08-13",reporter:"교직원",image:null}
];

const DEMO_UNIFORMS = [
  {id:1,name:"교복 상의",size:"95",stock:4,total:6},
  {id:2,name:"교복 하의",size:"80",stock:3,total:5},
  {id:3,name:"생활복 상의",size:"100",stock:7,total:10},
  {id:4,name:"체육복 상의",size:"95",stock:2,total:4},
  {id:5,name:"체육복 하의",size:"80",stock:5,total:7}
];

const FAQ = [
  ["분실물을 발견했어요. 어떻게 등록하나요?","분실물 메뉴의 '+ 분실물 등록' 버튼을 누르고 물건 이름, 습득 장소, 날짜와 사진을 등록하세요. 실제 운영 시에는 담당 선생님의 확인 후 게시하는 것을 권장합니다."],
  ["내 물건이 분실물 목록에 있어요. 어떻게 찾나요?","목록의 사진과 습득 장소를 확인한 뒤 학교에서 정한 분실물 보관 장소 또는 담당 선생님에게 문의하세요."],
  ["교복은 누구나 빌릴 수 있나요?","이 프로토타입에서는 누구나 신청할 수 있지만, 실제 학교 서비스에서는 학생 인증과 담당자 승인을 추가하는 것이 좋습니다."],
  ["교복 대여 신청 후 바로 받을 수 있나요?","실제 운영에서는 담당 선생님의 승인과 수령 확인을 거친 뒤 대여하도록 설정하는 것을 권장합니다."],
  ["사진을 올렸는데 다른 학생도 볼 수 있나요?","현재 버전은 브라우저에만 저장되는 데모입니다. 여러 학생이 함께 사용하는 서비스로 만들려면 Firebase나 Supabase 같은 데이터베이스/스토리지를 연결해야 합니다."]
];

function load(key, fallback){
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
let lostItems = load("yeong_lost", DEMO_LOST);
let uniforms = load("yeong_uniforms", DEMO_UNIFORMS);

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function save(){
  localStorage.setItem("yeong_lost", JSON.stringify(lostItems));
  localStorage.setItem("yeong_uniforms", JSON.stringify(uniforms));
}

function showPage(id){
  $$(".page").forEach(p=>p.classList.toggle("active",p.id===id));
  $$(".tab").forEach(t=>t.classList.toggle("active",t.dataset.target===id));
  window.scrollTo({top:0,behavior:"smooth"});
}
$$(".tab,.go-tab").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.target)));

function renderLost(){
  $("#lostCount").textContent = lostItems.length;
  $("#lostList").innerHTML = lostItems.length ? lostItems.map(x=>`
    <article class="item">
      ${x.image ? `<img src="${x.image}" alt="${x.name}">` : `<div style="height:180px;display:grid;place-items:center;background:#eef1f5;font-size:48px">📦</div>`}
      <div class="item-body">
        <h3>${escapeHtml(x.name)}</h3>
        <div class="meta">📍 ${escapeHtml(x.place)}<br>📅 ${x.date}<br>👤 ${escapeHtml(x.reporter||"미입력")}</div>
        <span class="status">보관 중</span>
      </div>
    </article>`).join("") : `<div class="card">현재 등록된 분실물이 없습니다.</div>`;
}

function renderUniforms(){
  $("#uniformCount").textContent = uniforms.reduce((a,x)=>a+x.stock,0);
  $("#uniformList").innerHTML = uniforms.map(x=>`
    <article class="item uniform-card">
      <h3>${escapeHtml(x.name)}</h3>
      <div class="meta">권장/보유 사이즈: ${escapeHtml(x.size)}</div>
      <div class="stock">${x.stock}<small> / 총 ${x.total}벌</small></div>
      <button class="primary-btn loan-btn" data-id="${x.id}" ${x.stock===0?"disabled":""}>대여 신청</button>
    </article>`).join("");
  $$(".loan-btn").forEach(b=>b.addEventListener("click",()=>{
    $("#loanItem").value=b.dataset.id;
    $("#loanForm").classList.remove("hidden");
    $("#loanForm").scrollIntoView({behavior:"smooth"});
  }));
  $("#loanItem").innerHTML = uniforms.map(x=>`<option value="${x.id}" ${x.stock===0?"disabled":""}>${escapeHtml(x.name)} (${x.size}) - ${x.stock}벌</option>`).join("");
}

function renderFaq(filter=""){
  const q=filter.trim().toLowerCase();
  $("#faqList").innerHTML=FAQ.filter(([a,b])=>(a+b).toLowerCase().includes(q)).map(([a,b])=>`
    <article class="faq">
      <h3>Q. ${escapeHtml(a)}</h3>
      <p>A. ${escapeHtml(b)}</p>
    </article>`).join("") || `<div class="card">검색 결과가 없습니다.</div>`;
  $$(".faq").forEach(x=>x.addEventListener("click",()=>x.classList.toggle("open")));
}

$("#showLostForm").addEventListener("click",()=>$("#lostForm").classList.remove("hidden"));
$("#cancelLost").addEventListener("click",()=>$("#lostForm").classList.add("hidden"));
$("#lostForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const file=$("#lostImage").files[0];
  let image=null;
  if(file) image=await resizeImage(file,900);
  lostItems.unshift({
    id:Date.now(), name:$("#lostName").value, place:$("#lostPlace").value,
    date:$("#lostDate").value, reporter:$("#lostReporter").value||"미입력", image
  });
  save(); renderLost(); e.target.reset(); e.target.classList.add("hidden");
  alert("분실물이 등록되었습니다.");
});

$("#cancelLoan").addEventListener("click",()=>$("#loanForm").classList.add("hidden"));
$("#loanForm").addEventListener("submit",e=>{
  e.preventDefault();
  const item=uniforms.find(x=>x.id===$("#loanItem").value);
  if(!item || item.stock<=0) return;
  item.stock--;
  save(); renderUniforms(); $("#loanForm").classList.add("hidden");
  $("#loanMessage").classList.remove("hidden");
  $("#loanMessage").textContent=`${item.name} 대여 신청이 접수되었습니다. 실제 수령은 교복실 담당자에게 확인하세요.`;
});

$("#faqSearch").addEventListener("input",e=>renderFaq(e.target.value));
$("#resetDemo").addEventListener("click",()=>{
  if(confirm("데모 데이터를 초기화할까요?")){
    lostItems=JSON.parse(JSON.stringify(DEMO_LOST));
    uniforms=JSON.parse(JSON.stringify(DEMO_UNIFORMS));
    save(); renderLost(); renderUniforms(); renderFaq();
  }
});

function escapeHtml(v){
  return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function resizeImage(file,maxWidth){
  return new Promise(resolve=>{
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const scale=Math.min(1,maxWidth/img.width);
        const c=document.createElement("canvas");
        c.width=img.width*scale;c.height=img.height*scale;
        c.getContext("2d").drawImage(img,0,0,c.width,c.height);
        resolve(c.toDataURL("image/jpeg",0.78));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

renderLost(); renderUniforms(); renderFaq();
