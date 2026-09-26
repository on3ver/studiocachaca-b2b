
const PRODUCTS = [
  {id:"prata750", category:"studio60", name:"Studio 60 Prata 750ml", wood:"Tanque de Inox", abv:"39%", price:null, label:"PRATA", badge:"STUDIO 60"},
  {id:"amburana750", category:"studio60", name:"Studio 60 Amburana 750ml", wood:"Amburana", abv:"39%", price:null, label:"AMBURANA", badge:"STUDIO 60"},
  {id:"carvalho750", category:"studio60", name:"Studio 60 Carvalho Europeu 750ml", wood:"Carvalho Europeu", abv:"39%", price:null, label:"CARVALHO", badge:"STUDIO 60"},
  {id:"premium750", category:"studio60", name:"Studio 60 Premium Envelhecida 750ml", wood:"Envelhecida", abv:"39%", price:null, label:"PREMIUM", badge:"STUDIO 60"},
  {id:"sgamb1l", category:"saogotardo", name:"São Gotardo Amburana 1L", wood:"Amburana", abv:"Consultar", price:null, label:"AMBURANA", badge:"SÃO GOTARDO"},
  {id:"sgcarv1l", category:"saogotardo", name:"São Gotardo Carvalho 1L", wood:"Carvalho", abv:"Consultar", price:null, label:"CARVALHO", badge:"SÃO GOTARDO"},
  {id:"sgcast1l", category:"saogotardo", name:"São Gotardo Castanheira 1L", wood:"Castanheira", abv:"Consultar", price:null, label:"CASTANHEIRA", badge:"SÃO GOTARDO"},
  {id:"sgjeq1l", category:"saogotardo", name:"São Gotardo Jequitibá Rosa 1L", wood:"Jequitibá Rosa", abv:"Consultar", price:null, label:"JEQUITIBÁ", badge:"SÃO GOTARDO"}
];

const cart = {};

function money(v){
  if(v == null) return "A DEFINIR";
  return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}

function renderProducts(filter="todos"){
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";
  PRODUCTS.filter(p => filter==="todos" || p.category===filter).forEach(p=>{
    const card=document.createElement("article");
    card.className="product-card";
    card.innerHTML=`
      <div class="product-media">
        <span class="product-badge">${p.badge}</span>
        <div class="mini-bottle">
          <div class="cap"></div><div class="neck"></div>
          <div class="body"><div class="label">STUDIO<br><b>60</b><br>${p.label}</div></div>
        </div>
      </div>
      <div class="product-content">
        <span class="product-brand">CATÁLOGO DE REVENDA</span>
        <h3>${p.name}</h3>
        <div class="product-meta">${p.wood} • ${p.abv}</div>
        <div class="price-row">
          <div><span class="price-label">Preço revendedor</span><span class="price">${money(p.price)}</span></div>
          <div class="qty-control">
            <button aria-label="Diminuir" data-minus="${p.id}">−</button>
            <input aria-label="Quantidade" id="qty-${p.id}" value="${cart[p.id]||0}" inputmode="numeric">
            <button aria-label="Aumentar" data-plus="${p.id}">+</button>
          </div>
        </div>
        <button class="add-btn" data-add="${p.id}">ATUALIZAR PEDIDO</button>
      </div>`;
    grid.appendChild(card);
  });
  bindControls();
}

function bindControls(){
  document.querySelectorAll("[data-plus]").forEach(btn=>btn.onclick=()=>{
    const id=btn.dataset.plus, input=document.getElementById("qty-"+id);
    input.value=(parseInt(input.value)||0)+1;
  });
  document.querySelectorAll("[data-minus]").forEach(btn=>btn.onclick=()=>{
    const id=btn.dataset.minus, input=document.getElementById("qty-"+id);
    input.value=Math.max(0,(parseInt(input.value)||0)-1);
  });
  document.querySelectorAll("[data-add]").forEach(btn=>btn.onclick=()=>{
    const id=btn.dataset.add, input=document.getElementById("qty-"+id);
    const q=Math.max(0,parseInt(input.value)||0);
    if(q===0) delete cart[id]; else cart[id]=q;
    renderOrder();
  });
}

function renderOrder(){
  const list=document.getElementById("orderList");
  const entries=Object.entries(cart).filter(([,q])=>q>0);
  if(!entries.length){
    list.innerHTML='<div class="empty-order">Seu pedido ainda está vazio.</div>';
  }else{
    list.innerHTML=entries.map(([id,q])=>{
      const p=PRODUCTS.find(x=>x.id===id);
      const subtotal=p.price==null?null:p.price*q;
      return `<div class="order-item">
        <div><strong>${p.name}</strong><small>${q} unidade(s)</small></div>
        <div>${subtotal==null?"Valor a confirmar":money(subtotal)}</div>
        <button data-remove="${id}">remover</button>
      </div>`;
    }).join("");
    document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{
      delete cart[b.dataset.remove];
      renderProducts(document.querySelector(".filter.active")?.dataset.filter||"todos");
      renderOrder();
    });
  }
  const units=entries.reduce((s,[,q])=>s+q,0);
  const known=entries.every(([id])=>PRODUCTS.find(x=>x.id===id).price!=null);
  const total=entries.reduce((s,[id,q])=>{
    const p=PRODUCTS.find(x=>x.id===id);
    return s+(p.price||0)*q;
  },0);
  document.getElementById("itemsCount").textContent=units;
  document.getElementById("orderTotal").textContent=entries.length?(known?money(total):"A confirmar"):"R$ 0,00";
  document.getElementById("sendOrder").disabled=!entries.length;
}

document.querySelectorAll(".filter").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  renderProducts(btn.dataset.filter);
});

document.getElementById("sendOrder").onclick=()=>{
  const entries=Object.entries(cart).filter(([,q])=>q>0);
  if(!entries.length) return;
  const lines=entries.map(([id,q])=>{
    const p=PRODUCTS.find(x=>x.id===id);
    return `• ${q}x ${p.name}${p.price!=null?` — ${money(p.price*q)}`:""}`;
  });
  const msg=[
    "Olá! Gostaria de solicitar este pedido para revenda na Studio Cachaça:",
    "",
    ...lines,
    "",
    "Por favor, podem confirmar valores, estoque, frete e condições comerciais?"
  ].join("\n");
  window.open("https://wa.me/5534984407659?text="+encodeURIComponent(msg),"_blank");
};

document.getElementById("menuBtn").onclick=()=>document.getElementById("nav").classList.toggle("open");

renderProducts();
renderOrder();
