let services=[];
const $=id=>document.getElementById(id);
const money=n=>Number(n).toLocaleString()+" RWF";
async function init(){
 services=await (await fetch("/api/services")).json();
 $("services").innerHTML=services.map(s=>`<article class="service" onclick="choose(${s.id})"><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p><strong>${money(s.price)}</strong></article>`).join("");
 $("service").innerHTML='<option value="">Select service</option>'+services.map(s=>`<option value="${s.id}">${esc(s.name)} — ${money(s.price)}</option>`).join("");
 $("service").onchange=update;$("qty").oninput=update;
}
function choose(id){$("service").value=id;update();$("form").scrollIntoView({behavior:"smooth"})}
function update(){const s=services.find(x=>x.id==$("service").value);$("total").textContent=money(s?s.price*(+$("qty").value||1):0)}
$("form").onsubmit=async e=>{
 e.preventDefault();
 const body={customer_name:$("name").value,phone:$("phone").value,service_id:+$("service").value,quantity:+$("qty").value,notes:$("notes").value};
 const r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 const o=await r.json();if(!r.ok){$("result").textContent=o.error;return}
 $("payment").classList.remove("hidden");
 $("payment").innerHTML=`<div class="pay"><h3>Order #${o.order_id}</h3><p>${esc(o.service)} — <b>${money(o.total)}</b></p>
 <label>Payment<select id="method"><option value="MTN_MOMO">MTN MoMo</option><option value="AIRTEL_MONEY">Airtel Money</option></select></label>
 <button onclick="pay(${o.order_id})">Pay now</button>
 <small>Payment will be confirmed automatically when the live provider webhook is connected.</small></div>`;
};
async function pay(id){
 const r=await fetch("/api/payments/start",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({order_id:id,method:$("method").value})});
 const x=await r.json();
 $("result").innerHTML=x.success?`<div class="ok">✅ ${x.message}<br>Reference: <b>${x.reference}</b></div>`:`<div class="warn">⚠️ ${x.error}</div>`;
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
init();