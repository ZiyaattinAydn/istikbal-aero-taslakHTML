/* İstikbal Aerospace — independent, offline-friendly visual prototype.
   Visual backgrounds are illustrative; company claims and content require approval. No backend. */
const page=document.body.dataset.page||'home';
const A='assets/';
const NAV=[['home','Ana Sayfa','index.html'],['platforms','Platformlar','platformlar.html'],['tech','Teknolojiler','teknolojiler.html'],['projects','Projeler & AR-GE','projeler.html'],['news','Haberler','haberler.html'],['about','Kurumsal','kurumsal.html'],['contact','İletişim','iletisim.html']];
const PLATFORMS=[["Tüm Platformlar","platformlar.html","Platformlar ve sistem alanlarına genel bakış"],["İnsansız Hava Sistemleri","iha-sistemleri.html","İHA platform mimarileri"],["Gömülü Uçuş Mimarileri","ucus-mimarileri.html","Uçuş elektroniği ve gömülü sistemler"],["Hava Savunma Ağları","hava-savunma-aglari.html","Bağlantılı savunma sistemleri"]];
const TECH=[['Tüm Teknolojiler','teknolojiler.html','Teknoloji alanlarına genel bakış'],['Tengri AI','tengri-ai.html','Özel teknoloji sayfası'],['Kabiliyetler','kabiliyetler.html','Mühendislik disiplinleri'],['Otonom Sistemler','otonom-sistemler.html','Otonomi ve sistem yaklaşımı'],['Gömülü Sistemler','gomulu-sistemler.html','Donanım ve yazılım bütünlüğü'],['Sensör Füzyonu','sensor-fuzyonu.html','Algılama ve veri entegrasyonu'],['Roket Sistemleri','roket-sistemleri.html','Kamuya açık uzmanlık alanı'],['İleri Haberleşme','ileri-haberlesme.html','Veri bağlantıları ve sistem iletişimi']];
const brand=`<a class="brand" href="index.html" aria-label="İstikbal Aerospace ana sayfa"><span class="logo-mark"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 1L39 20L20 39L1 20Z" stroke="#35b7e6" stroke-width="1.2" fill="none"/><path d="M20 10L23 17L30 20L23 23L20 30L17 23L10 20L17 17Z" fill="#35b7e6"/></svg></span><span class="brand-text">İSTİKBAL AEROSPACE</span></a>`;
function platformTrigger(mobile = false) {
  const buttonId = mobile ? 'mobile-platform' : 'platform-trigger';
  const panelId = mobile ? 'mobile-platform-sub' : 'platform-menu';
  const arrow = mobile ? '<span aria-hidden="true">＋</span>' :
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 7 6 6 6-6" stroke="currentColor" stroke-width="2"/></svg>';
  const inPlatform = ['platforms','platformDetail','iha','flightArch','airDefense'].includes(page);
  const className = mobile ? '' : 'nav-link' + (inPlatform ? ' active' : '');
  const attrs = 'type="button" id="' + buttonId + '" class="' + className + '" aria-controls="' + panelId + '" aria-expanded="false"';
  if (page === 'platforms') {
    return '<div class="' + (mobile ? 'mobile-platform-current' : 'platform-current') +
      '"><a class="' + (mobile ? '' : 'nav-link active') + '" href="platformlar.html">Platformlar</a><button ' +
      attrs + ' aria-label="Platform alanları">' + arrow + '</button></div>';
  }
  return '<button ' + attrs + '>Platformlar ' + arrow + '</button>';
}
function technologyTrigger(mobile = false) {
  const buttonId = mobile ? 'mobile-tech' : 'tech-trigger';
  const panelId = mobile ? 'mobile-sub' : 'mega-menu';
  const arrow = mobile ? '<span aria-hidden="true">＋</span>' :
    '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 7 6 6 6-6" stroke="currentColor" stroke-width="2"/></svg>';
  const inTechnology = ['tech', 'tengri', 'capabilities', 'autonomy', 'embedded', 'sensors', 'rockets', 'communications'].includes(page);
  const className = mobile ? '' : `nav-link${inTechnology ? ' active' : ''}`;
  const attrs = `type="button" id="${buttonId}" class="${className}" aria-controls="${panelId}" aria-expanded="false"`;
  if (page === 'tech') {
    // The current page label can return to the top, and the chevron remains an independent disclosure.
    return `<div class="${mobile ? 'mobile-tech-current' : 'tech-current'}"><a class="${mobile ? '' : 'nav-link active'}" href="teknolojiler.html">Teknolojiler</a><button ${attrs} aria-label="Teknoloji alanları">${arrow}</button></div>`;
  }
  return `<button ${attrs}>Teknolojiler ${arrow}</button>`;
}
function header(){let nav=NAV.map(([k,l,h])=>k==='platforms'?platformTrigger():k==='tech'?technologyTrigger():`<a class="nav-link ${page===k||(k==='platforms'&&['platformDetail','iha','flightArch','airDefense'].includes(page))||(k==='projects'&&page==='projectDetail')||(k==='news'&&['newsDetail','flightControlNews'].includes(page))?'active':''}" href="${h}">${l}</a>`).join('');
let pm=PLATFORMS.map(([n,u,d])=>`<a class="mega-item" href="${u}"><span><strong>${n}</strong><span>${d}</span></span><span class="arrow" aria-hidden="true">↗</span></a>`).join('');let ml=TECH.map(([n,u,d])=>`<a class="mega-item" href="${u}"><span><strong>${n}</strong><span>${d}</span></span><span class="arrow">↗</span></a>`).join('');let mobile=NAV.map(([k,l,h])=>k==='platforms'?`${platformTrigger(true)}<div id="mobile-platform-sub" class="mobile-sub" hidden>${PLATFORMS.map(x=>`<a href="${x[1]}">${x[0]}</a>`).join('')}</div>`:k==='tech'?`${technologyTrigger(true)}<div id="mobile-sub" class="mobile-sub" hidden>${TECH.map(x=>`<a href="${x[1]}">${x[0]}</a>`).join('')}</div>`:`<a href="${h}">${l}<span>↗</span></a>`).join('');return `<header class="site-header"><div class="header-inner">${brand}<nav class="desktop-nav" aria-label="Ana menü">${nav}</nav><div class="header-tools"><span class="lang" aria-label="Sayfa dili Türkçe">TR</span></div><button class="mobile-trigger" id="mobile-trigger" type="button" aria-label="Menüyü aç" aria-expanded="false" aria-controls="mobile-nav"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button></div><div id="platform-menu" class="mega" role="region" aria-label="Platformlar alt menü"><div class="mega-inner"><div class="mega-image" style="background-image:linear-gradient(0deg,rgba(7,17,27,.97),transparent 60%),url(&quot;assets/hero-hangar-photo.webp&quot;)"><span class="eyebrow no-rule">PLATFORMLAR / 01—04</span><h3>Platformdan sisteme.</h3><p>İnsansız hava platformları, uçuş elektroniği ve bağlantılı sistemler.</p></div><div class="mega-links"><div class="mega-links-head"><span class="eyebrow no-rule">PLATFORM ALANLARI</span><button class="close-platform" type="button" aria-label="Platform menüsünü kapat">×</button></div><div class="mega-list">${pm}</div></div></div></div><div id="mega-menu" class="mega" role="region" aria-label="Teknolojiler mega menü"><div class="mega-inner"><div class="mega-image"><span class="eyebrow no-rule">TEKNOLOJİLER / 01—08</span><h3>Fikirden sisteme.</h3><p>İstikbal Aerospace'in teknoloji ve mühendislik çalışma alanlarını keşfedin.</p></div><div class="mega-links"><div class="mega-links-head"><span class="eyebrow no-rule">TEKNOLOJİ ALANLARI</span><button class="close-mega" type="button" aria-label="Mega menüyü kapat" id="close-mega">×</button></div><div class="mega-list">${ml}</div></div></div></div><nav class="mobile-nav" id="mobile-nav" aria-label="Mobil menü">${mobile}</nav></header>`}
function btn(label,href,kind='outline'){return `<a class="btn ${kind}" href="${href}">${label}<span class="arrow" aria-hidden="true">↗</span></a>`}
function head(kicker,title,lead='',right=''){return `<div class="section-header"><div><span class="eyebrow">${kicker}</span><h2 class="section-title">${title}</h2>${lead?`<p class="lead">${lead}</p>`:''}</div>${right}</div>`}
function wrap(c){return `<div class="wrapper">${c}</div>`}
function section(content,cls=''){return `<section class="section ${cls}">${wrap(content)}</section>`}
function cardImg(bg){return `style="background-image:url('${A+bg}')"`}
function platformCard(title,seq,bg,large=false,href='iha-sistemleri.html',desc=''){return `<article class="platform-card ${large?'feature-platform':''}"><div class="card-image" ${cardImg(bg)}></div><div class="card-info"><span class="tag cool">MÜHENDİSLİK ALANI</span><span class="caption">SİSTEMLER / ${seq}</span><h3>${title}</h3>${desc?`<p class="platform-desc">${desc}</p>`:''}<a href="${href}" class="text-link">Yakından İncele <span>↗</span></a></div></article>`}
function techCard(title,seq,ico,description,href='kabiliyetler.html'){return `<a class="tech-card" href="${href}"><span class="num">TECH / ${seq}</span><span class="symbol" aria-hidden="true">${ico}</span><h3>${title}</h3><p>${description}</p><div class="card-bottom"><span>DETAYLARI GÖR</span><span>↗</span></div></a>`}
function newsCard(title,cat,bg,href='haber-detay.html',description='İstikbal Aerospace’in kamuya açık teknoloji paylaşımı.'){return `<article class="news-card" data-category="${cat}"><div class="news-visual" ${cardImg(bg)}></div><span class="news-meta">${cat.toUpperCase()} · İSTİKBAL AEROSPACE</span><h3>${title}</h3><p>${description}</p><a href="${href}">Paylaşımı Oku ↗</a></article>`}
function innerHero(title,sub,bg,crumb='',kicker='İSTİKBAL AEROSPACE'){return `<section class="inner-hero"><div class="inner-bg" ${cardImg(bg)}></div><div class="wrapper"><div class="breadcrumb"><a href="index.html">ANA SAYFA</a> &nbsp; / &nbsp; <b>${crumb||title.toUpperCase()}</b></div><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${sub}</p></div></section>`}
function feature(title,kicker,copy,bg,reverse=false,link='',label='Daha Fazla'){return `<article class="feature-row ${reverse?'flip':''}"><div class="feature-art" ${cardImg(bg)}></div><div class="feature-copy"><span class="eyebrow no-rule">${kicker}</span><h2>${title}</h2><p>${copy}</p>${link?btn(label,link,'text'):''}</div></article>`}
function notice(){return `<div class="notice"><strong>BİLGİLENDİRME</strong> — Platform ve proje görselleri temsili çalışmalardır. Teknik özellikler ve kurumsal bilgiler resmî içerik onayından sonra güncellenecektir.</div>`}
function cta(){return `<section class="contact-cta">${wrap(`<div class="cta-flex"><div><span class="eyebrow">İLETİŞİM</span><h2>Bir sonraki adımı birlikte tasarlayalım.</h2></div>${btn('İletişime Geç','iletisim.html','solid')}</div>`)}</section>`}
function footer(){return `${cta()}<footer class="footer">${wrap(`<div class="footer-columns"><div class="footer-brand">${brand}<p class="footer-intro">Antalya merkezli İstikbal Aerospace; gömülü donanım, PCB tasarımı, otonom sistemler ve havacılık mühendisliği alanlarında çalışmalar yürütür.</p><div class="footer-loc">ANTALYA · TÜRKİYE</div></div><div><h4>Çözümler</h4><div class="footer-links"><a href="otonom-sistemler.html">Otonom Sistemler</a><a href="tengri-ai.html">Tengri AI Savunma Ağı</a><a href="gomulu-sistemler.html">Gömülü Donanım (PCB)</a><a href="sensor-fuzyonu.html">Sensör Füzyonu</a></div></div><div><h4>Keşfet</h4><div class="footer-links"><a href="platformlar.html">Platformlar</a><a href="teknolojiler.html">Teknolojiler</a><a href="projeler.html">Projeler & AR-GE</a><a href="haberler.html">Haberler & Duyurular</a><a href="kurumsal.html">Kurumsal</a></div></div><div><h4>İletişim</h4><div class="footer-links"><span>Kepez, Antalya / Türkiye</span><a href="mailto:abdullahdemiral@istikbalaerospace.com">abdullahdemiral@istikbalaerospace.com</a><a href="tel:+905462781931">+90 546 278 19 31</a><a href="iletisim.html" class="footer-contact">İletişim Formu ↗</a></div></div></div><div class="footer-bottom"><span>© 2026 İSTİKBAL AEROSPACE</span><span>HAVACILIK · GÖMÜLÜ SİSTEMLER · OTONOMİ</span></div>`)}</footer>`}
function homepage(){return `<section class="hero hero-story" aria-label="İstikbal Aerospace havacılık vitrini" style="--scene-progress:0"><div class="hero-stage">
  <div class="hero-scene hero-scene-flight" role="img" aria-label="Gün doğumunda dağların üzerinde uçan markasız temsili hava aracı"></div>
  <div class="hero-scene hero-scene-hangar" role="img" aria-label="Alacakaranlıkta havacılık hangarındaki markasız temsili hava aracı"></div>
  <div class="hero-story-vignette" aria-hidden="true"></div>
  <div class="hero-story-lines" aria-hidden="true"></div>
  <div class="wrapper hero-story-layout">
    <div class="hero-story-content">
      <div class="hero-story-eyebrow"><span class="hero-kicker-dash" aria-hidden="true"></span> HAVACILIK <span class="slash">/</span> OTONOM SİSTEMLER</div>
      <h1><span class="hero-title-line">Geleceğin</span><span class="hero-title-line accent">sistemlerini</span><span class="hero-title-line">tasarlıyoruz.</span></h1>
      <div class="hero-subline" aria-hidden="true"></div>
      <p class="hero-story-copy">Havacılık, gömülü elektronik ve otonom sistemlerin kesişiminde mühendislik.</p>
      <div class="hero-story-actions"><a class="btn solid" href="platformlar.html">Platformları Keşfet <span class="arrow" aria-hidden="true">↗</span></a><a class="btn outline" href="teknolojiler.html">Teknolojileri İncele <span class="arrow" aria-hidden="true">↗</span></a></div>
    </div>
  </div>
  </div>
</section>
${section(`<div id="homepage-intro" class="intro"><div><span class="eyebrow">SİSTEM MÜHENDİSLİĞİ</span><p class="intro-quote">Gömülü elektronik.<br>Otonom hareket.<br>Entegre sistemler.</p><div class="stat-lines"><span>DONANIM</span><span>YAZILIM</span><span>SİSTEM ENTEGRASYONU</span></div></div><div class="intro-copy"><strong>Birbiriyle çalışan teknolojiler.</strong><br>İstikbal Aerospace; insansız hava araçları, PCB tasarımı, gömülü sistemler ve otonom algoritmalar çevresinde şekillenen mühendislik alanlarına odaklanıyor. Sensörlerden elde edilen verinin işlenmesinden sistem düzeyinde entegrasyona kadar uzanan bir teknoloji yaklaşımı.</div></div>`)}
${section(`${head('01 / HAVA & SİSTEMLER','Havacılığın farklı katmanları.','İnsansız hava platformlarından uçuş elektroniğine, bağlantılı sistem mimarilerinden otonom çözümlere uzanan çalışma alanları.',btn('Platformlar','platformlar.html','text'))}<div class="platform-grid">${platformCard('İnsansız Hava Sistemleri','01','hero-hangar-photo.webp',true,'iha-sistemleri.html','İnsansız platform mimarileri ve hava aracı sistemleri.')}${platformCard('Gömülü Uçuş Mimarileri','02','platform-systems.svg',false,'ucus-mimarileri.html','Donanım, yazılım ve kontrol katmanları.')}${platformCard('Hava Savunma Ağları','03','platform-flight.svg',false,'hava-savunma-aglari.html','Birbirine bağlı savunma sistemleri yaklaşımı.')}</div>`)}
${section(`${head('02 / TEKNOLOJİLER','Sistemin ardındaki mühendislik.','Elektronik tasarımdan verinin birleştirilmesine uzanan temel çalışma alanları.',btn('Teknolojiler','teknolojiler.html','text'))}<div class="cards-2">${techCard('Otonom Sistemler','01','⌁','Algılama, karar süreçleri ve kontrol algoritmaları.','otonom-sistemler.html')}${techCard('Gömülü Sistemler & PCB','02','▦','Elektronik kart tasarımı, donanım ve gömülü yazılım.','gomulu-sistemler.html')}${techCard('Sensör Füzyonu','03','◎','Farklı algılayıcılardan gelen verilerin bütünleştirilmesi.','sensor-fuzyonu.html')}${techCard('Yapay Zekâ & Tengri AI','04','⟡','Ağ tabanlı karar destek ve savunma teknolojileri yaklaşımı.','tengri-ai.html')}</div>`,'inner-panel')}
<section class="tengri-band"><div class="tengri-visual" aria-hidden="true"><i class="signal-ring"></i><i class="signal-trace"></i></div><div class="tengri-shade"></div>${wrap(`<div class="tengri-inner"><span class="eyebrow">03 / YAPAY ZEKÂ VE KOMUTA KONTROL</span><h2>TENGRİ AI</h2><p>Hava ve kara sistemlerinin koordinasyonuna yönelik yapay zekâ temelli savunma ağı yaklaşımı. Algılama, tehdit değerlendirme ve karar destek katmanları üzerine çalışmalar.</p><div style="margin-bottom:27px" class="tengri-outline">YAPAY ZEKÂ · AĞ MİMARİLERİ · KARAR DESTEK</div>${btn('Tengri AI','tengri-ai.html','solid')}</div>`)}</section>
${section(`${head('04 / PROJELER & AR-GE','Araştırmadan uygulamaya.','PCB tasarımı, otonom hareket mühendisliği ve gömülü donanım gibi alanlarda araştırma ve geliştirme yaklaşımı.',btn('AR-GE Alanları','projeler.html','text'))}<div class="split-feature"><div class="visual" ${cardImg('research-lab.svg')}></div><div class="copy"><span class="tag cool">AR-GE & ELEKTRONİK</span><h2>Sistemler, detaylarda şekillenir.</h2><p>Elektronik donanım, gömülü yazılım ve otonom kontrolün birbirini tamamlayan disiplinler olarak ele alındığı mühendislik alanları.</p>${btn('Projeler & AR-GE','projeler.html','outline')}</div></div>`)}
${section(`${head('05 / HABERLER & DUYURULAR','Kamuya açık gelişmeler.','Şirketin paylaştığı teknoloji çalışmalarına ve duyurularına göz atın.',btn('Tüm Yayınlar','haberler.html','text'))}<div class="news-feature"><div class="news-feature-art" ${cardImg('tengri-network.svg')}></div><div class="news-feature-copy"><span class="eyebrow no-rule">ŞİRKET PAYLAŞIMI / TENGRİ AI</span><h3>Tengri AI: Yapay zekâ destekli savunma ağı yaklaşımı</h3><p>İstikbal Aerospace tarafından kamuya açık olarak tanıtılan Tengri AI'ın odaklandığı teknoloji alanlarını keşfedin.</p>${btn('Gelişmeyi İncele','haber-detay.html','text')}</div></div>`,'inner-panel')}
${section(`<div class="split-feature reverse"><div class="visual" ${cardImg('hero-hangar-photo.webp')}></div><div class="copy"><span class="eyebrow no-rule">06 / İSTİKBAL AEROSPACE</span><h2>Antalya'dan geleceğin teknolojilerine.</h2><p>Antalya merkezli İstikbal Aerospace; havacılık, gömülü elektronik, PCB tasarımı ve otonom sistem mühendisliğini bir araya getiren çalışmalar yürütür.</p>${btn('Hakkımızda','kurumsal.html','outline')}</div></div>`)}
`}
function platforms(){
  const systemCards = '<div class="platform-grid">' +
    platformCard('İnsansız Hava Sistemleri','01','hero-hangar-photo.webp',true,'iha-sistemleri.html','Uçuş kontrolü, algılama ve bağlantılı alt sistemlerin bütünleşik mimarisi.') +
    platformCard('Gömülü Uçuş Mimarileri','02','platform-systems.svg',false,'ucus-mimarileri.html','Uçuş elektroniği, gömülü yazılım ve platform kontrolünün bileşenleri.') +
    platformCard('Hava Savunma Ağları','03','platform-flight.svg',false,'hava-savunma-aglari.html','Bağlantılı sistemler ve karar destek teknolojileri yaklaşımı.') + '</div>';
  const intro = head('HAVACILIK & SİSTEMLER','Platformdan alt sisteme.','İstikbal Aerospace’in kamuya açık uzmanlık alanlarından hareketle sunulan sistem aileleri. Bu başlıklar bir ürün kataloğu değil, mühendislik alanlarıdır.');
  const controller = feature(
    'Yapay zekâ destekli uçuş kontrolü.',
    'KAMUYA AÇIK TEKNOLOJİ TANITIMI',
    'Şirketin paylaştığı yeni nesil uçuş kontrolcüsü tanıtımında yapay zekâ ile ilişkili kontrol algoritmaları, uçuş güvenliği ve verimlilik hedefleri öne çıkıyor. Teknolojinin mühendislik temellerini inceleyin.',
    'platform-systems.svg',
    false,
    'ucus-kontrol-paylasimi.html',
    'Tanıtımı İncele'
  );
  const disciplines = head('İLGİLİ TEKNOLOJİLER','Bir platformun ötesindeki sistemler.','Elektronik tasarım, yazılım ve sensör verisinin birlikte değerlendirilmesi platform mühendisliğinin temelindedir.');
  return innerHero('Platformlar','Hava platformları, uçuş kontrolü ve sistem mühendisliği odağındaki çalışma başlıkları.','hero-hangar-photo.webp') +
    section(intro+systemCards) +
    section(controller,'inner-panel') +
    section(disciplines+'<div class="cards-3">'+
      techCard('Otonom Sistemler','01','⌁','Algılama ve kontrolün birleştiği yazılım alanı.','otonom-sistemler.html')+
      techCard('Gömülü Sistemler','02','▦','Uçuş elektroniği ve sistem denetimi.','gomulu-sistemler.html')+
      techCard('Sensör Füzyonu','03','◎','Çoklu veri kaynağının birlikte değerlendirilmesi.','sensor-fuzyonu.html')+'</div>');
}
function technologies(){return `${innerHero('Teknolojiler','Donanım, kontrol, algılama ve yapay zekâ tabanlı sistemlerin buluştuğu mühendislik alanları.','platform-systems.svg')}${section(`${head('TEKNOLOJİ ALANLARI','Donanımdan otonomiye.','Elektronik tasarımın, yazılımın ve sistem mimarisinin birbirini tamamladığı disiplinler.')}<div class="cards-2">${techCard('Otonom Sistemler','01','⌁','Sensör verilerinin değerlendirilmesi, karar ve kontrol algoritmaları.','otonom-sistemler.html')}${techCard('Gömülü Donanım & PCB','02','▦','Elektronik kart tasarımı, işlemci tabanlı sistemler ve gömülü yazılım.','gomulu-sistemler.html')}${techCard('Sensör Füzyonu','03','◎','Birden fazla algılayıcıdan gelen bilginin birlikte işlenmesi.','sensor-fuzyonu.html')}${techCard('Yapay Zekâ / Tengri AI','04','⟡','Karar destek ve bağlantılı savunma ağlarına odaklanan teknoloji yaklaşımı.','tengri-ai.html')}${techCard('Roket Sistemleri','05','◇','Roket teknolojileriyle ilişkili uçuş elektroniği, telemetri ve sistem mühendisliğine genel bakış.','roket-sistemleri.html')}${techCard('İleri Haberleşme','06','⌁','Bağlantılı platformlarda veri iletimi, güvenli haberleşme ve sistem entegrasyonu.','ileri-haberlesme.html')}</div>`)}${section(`<div class="split-feature"><div class="visual" ${cardImg('tengri-network.svg')}></div><div class="copy"><span class="eyebrow no-rule">YAPAY ZEKÂ / TENGRİ AI</span><h2>Ağ bağlantılı karar destek.</h2><p>Tengri AI, şirketin kamuya açık tanıtımında bağlı hava ve kara sistemlerinin koordinasyonunu hedefleyen yapay zekâ yaklaşımı olarak anlatılıyor.</p>${btn('Tengri AI','tengri-ai.html','solid')}</div></div>`,'inner-panel')}${section(`${feature('Mühendislik kabiliyetleri.','SİSTEMİN ALT KATMANLARI','Gömülü yazılım, elektronik donanım, sensör füzyonu ve sistem entegrasyonunun mühendislik boyutlarını inceleyin.','research-lab.svg',true,'kabiliyetler.html','Kabiliyetler')}`)}` }
function capabilities(){return `${innerHero('Kabiliyetler','İnsansız sistemlerden gömülü elektroniğe uzanan mühendislik çalışma alanları.','research-lab.svg','TEKNOLOJİLER / KABİLİYETLER')}${section(`${head('MÜHENDİSLİK & TEKNOLOJİ ALANLARI','Sistemlerin yapı taşları.','İstikbal Aerospace’in kamuya açık faaliyet ve uzmanlık tanıtımlarında yer alan başlıklar: insansız hava sistemleri, roket sistemleri, hava savunma ağları, haberleşme, gömülü donanım ve algılama.')}<div class="cards-3">${techCard('İnsansız Hava Araçları','01','✈','Hava platformları ve otonom uçuş mimarileri.','iha-sistemleri.html')}${techCard('Hava Savunma Ağları','02','⌁','Ağ bağlantılı hava savunma ve karar destek yaklaşımı.','hava-savunma-aglari.html')}${techCard('İleri Haberleşme','03','⌁','Bağlantılı platformlar ve taktik veri iletimi odağı.','ileri-haberlesme.html')}${techCard('Roket Sistemleri','04','◇','Roket projelerinde uçuş elektroniği ve sistem entegrasyonu hakkında genel mühendislik çerçevesi.','roket-sistemleri.html')}${techCard('Gömülü Donanım & PCB','05','▦','Elektronik kart tasarımı ve donanım-yazılım bütünlüğü.','gomulu-sistemler.html')}${techCard('Sensör Füzyonu','06','◎','Birden fazla veri kaynağının birlikte değerlendirilmesi.','sensor-fuzyonu.html')}</div>`)}${section(`${feature('Otonom Sistemler','OTONOMİ','Veri analizi, kontrol mantığı ve karar mekanizmalarının bir arada ele alındığı sistemler.','platform-flight.svg',false,'otonom-sistemler.html','Detayları İncele')}<div style="height:28px"></div>${feature('Gömülü Donanım & PCB','ELEKTRONİK','Elektronik kart tasarımı, gömülü işlemciler ve donanım-yazılım entegrasyonu.','platform-systems.svg',true,'gomulu-sistemler.html','Detayları İncele')}<div style="height:28px"></div>${feature('Sensör Füzyonu','ALGILAMA','Farklı sensör verilerinin işlenmesi ve tek bir sistem görünümüne dönüştürülmesi.','tengri-network.svg',false,'sensor-fuzyonu.html','Detayları İncele')}`)}${section(`${head('YAPAY ZEKÂ','Tengri AI.','Ağ merkezli karar desteği ve yapay zekâ sistemleri üzerine şirketin paylaştığı teknoloji yaklaşımını keşfedin.',btn('Tengri AI','tengri-ai.html','solid'))}`,'inner-panel')}` }
function tengri(){
  const intro = head(
    'TENGRİ AI',
    'Birden fazla sistem. Ortak bir karar resmi.',
    'Tengri AI; hava savunma ağları, insansız sistemler, roket teknolojileri ve haberleşme altyapılarının birlikte ele alındığı çok katmanlı bir yapay zekâ ve karar destek vizyonudur.'
  );
  const introduction = '<div class="split-feature"><div class="visual" ' + cardImg('tengri-network.svg') + '></div><div class="copy">' +
    '<span class="eyebrow no-rule">AĞ MERKEZLİ YAPAY ZEKÂ</span>' +
    '<h2>Veriyi anlamlandıran, sistemleri buluşturan yaklaşım.</h2>' +
    '<p>Tengri AI’ın odağında sensör ve platform verilerinden durumsal farkındalık oluşturulması, tehditlerin değerlendirilmesi ve karar süreçlerinin desteklenmesi yer alır. Amaç, birbirinden ayrı sistemleri daha bütünlüklü bir bilgi ve koordinasyon yapısı içinde değerlendirmektir.</p>' +
    '<p>Tasarımın temelinde çoklu kaynak verisi, tahmine dayalı analiz ve bağlantılı sistem mimarileri bulunur.</p>' +
    btn('İlgili Kabiliyetler','kabiliyetler.html','outline') + '</div></div>';
  const technology = head(
    'TANITIMDAKİ TEKNOLOJİ BAŞLIKLARI',
    'Algılama. Değerlendirme. Koordinasyon.',
    'Tengri AI yaklaşımının temelini oluşturan teknoloji başlıkları.'
  ) + '<div class="cards-3">' +
    techCard('Veri & Sensör Birleşimi','01','◎','Farklı kaynaklardan elde edilen bilgilerin ortak bir durum görünümüne katkıda bulunması.','sensor-fuzyonu.html') +
    techCard('Çoklu Hedef Takibi','02','⌁','Birden fazla hava unsuruna ilişkin iz bilgilerinin birlikte değerlendirilmesi fikri.','hava-savunma-aglari.html') +
    techCard('Tehdit Analizi','03','◇','Yapay zekâ destekli değerlendirme ve önceliklendirme süreçlerinin karar desteğindeki rolü.','hava-savunma-aglari.html') +
    techCard('Öngörüsel Değerlendirme','04','⟡','Gelişen durumların ve olası senaryoların önceden değerlendirilmesine yönelik yaklaşım.','otonom-sistemler.html') +
    techCard('Komuta & Kontrol','05','▦','Bağlı unsurlardan alınan bilgilerin ortak bir karar ve koordinasyon çerçevesinde incelenmesi.','hava-savunma-aglari.html') +
    techCard('Ağ Tabanlı Entegrasyon','06','↗','Farklı platform ve sistemlerin haberleşme ve veri paylaşımı yoluyla birlikte ele alınması.','ileri-haberlesme.html') +
    '</div>';
  const systemLayers = head(
    'ENTEGRE SİSTEM YAKLAŞIMI',
    'Bağlantılı bir teknoloji ekosistemi.',
    'Tengri AI’ın kamuya açık vizyonunda farklı sistem ailelerinin ortak bir yapıda değerlendirilmesi hedefleniyor.'
  ) + '<div class="focus-modules">' +
    '<article class="focus-module"><span class="num">01 / 03</span><h3>İnsansız Hava Platformları</h3><p>Hava araçları ve uçuş sistemlerinin sağladığı verilerin daha geniş bir durum değerlendirmesine dahil edilmesi yaklaşımı.</p></article>' +
    '<article class="focus-module"><span class="num">02 / 03</span><h3>Savunma Alt Sistemleri</h3><p>Hava savunma ve roket sistemleri gibi farklı bileşenler arasında ortak bilgi ve koordinasyon gereksinimi.</p></article>' +
    '<article class="focus-module"><span class="num">03 / 03</span><h3>Haberleşme Altyapısı</h3><p>Bağlantılı birimler arasında bilgi aktarımı, veri bütünlüğü ve sistemler arası iletişim kavramları.</p></article>' +
    '</div>';
  const vision = feature(
    'Kritik alanlar için durumsal farkındalık.',
    'VİZYON & KARAR DESTEK',
    'Kritik altyapılar, stratejik bölgeler ve olası tehdit senaryoları için durumsal farkındalık, önceliklendirme ve öngörüye dayalı değerlendirme bu teknoloji vizyonunun kullanım alanları arasında yer alır. Bunlar mevcut operasyonel yetenek olarak değil, hedeflenen çalışma alanları olarak ele alınmaktadır.',
    'research-lab.svg',
    false,
    'hava-savunma-aglari.html',
    'İlgili Teknolojiler'
  );
  const relation = head(
    'İLİŞKİLİ TEKNOLOJİLER',
    'Tengri AI ve sistem mühendisliği.',
    'Gömülü yazılım, sensör füzyonu, otonomi ve haberleşme; ağ bağlantılı yapay zekâ yaklaşımlarını tamamlayan mühendislik alanlarıdır.',
    btn('Tüm Teknolojiler','teknolojiler.html','solid')
  );
  return innerHero(
      'TENGRİ AI',
      'Çok katmanlı yapay zekâ, durumsal farkındalık ve bağlantılı savunma sistemleri vizyonu.',
      'tengri-network.svg',
      'TEKNOLOJİLER / TENGRİ AI',
      'YAPAY ZEKÂ / KARAR DESTEK'
    ) +
    section(intro + introduction) +
    section(technology,'inner-panel') +
    section(systemLayers) +
    section(vision,'inner-panel') +
    section(relation);
}
function projects(){
  const published = head(
    'KAMUYA AÇIK ÇALIŞMALAR',
    'Teknoloji fikirlerinden paylaşılan çalışmalara.',
    'İstikbal Aerospace’in kamuya açık tanıtımlarında yer alan çalışmalar. Geliştirme ve test aşamalarına ilişkin ayrıntılar şirket onayına bağlıdır.'
  );
  const highlights = '<div class="cards-3">' +
    newsCard('Tengri AI — Yapay zekâ ve savunma ağı konsepti','Paylaşım','tengri-network.svg','tengri-ai.html','Bağlantılı hava ve kara sistemleri arasında durumsal farkındalık ve karar desteği vizyonu.') +
    newsCard('Yeni nesil uçuş kontrolcüsü tanıtımı','Paylaşım','platform-systems.svg','ucus-kontrol-paylasimi.html','Yapay zekâ destekli kontrol algoritmalarını ve uçuş sistemlerini bir araya getirmeyi hedefleyen teknoloji paylaşımı.') +
    '</div>';
  const research = head(
    'AR-GE DİSİPLİNLERİ',
    'Elektronikten sisteme.',
    'Kurumsal faaliyet tanıtımında yer alan çalışma alanları; bunlar tek başına tamamlanmış projeler olarak listelenmemektedir.'
  ) + '<div class="cards-3">' +
    techCard('PCB Tasarımı','01','▦','Gömülü donanım için elektronik kart mimarileri.','gomulu-sistemler.html') +
    techCard('Otonom Hareket','02','⌁','Karar, kontrol ve geri bildirim mekanizmaları.','otonom-sistemler.html') +
    techCard('Algılama & Veri','03','◎','Sensör bilgisi ve sistem entegrasyonu.','sensor-fuzyonu.html') +
    '</div>';
  const process = head(
    'MÜHENDİSLİK YAKLAŞIMI',
    'Araştırma, uygulama, bütünleştirme.',
    'Fikirlerin donanım ve yazılımla buluştuğu sistem geliştirme adımları.'
  ) + '<div class="steps">' +
    '<div class="step"><span class="n">01</span><h3>İhtiyaç Analizi</h3><p>Görev ve sistem gereksinimlerinin belirlenmesi.</p></div>' +
    '<div class="step"><span class="n">02</span><h3>Elektronik Tasarım</h3><p>Donanım ve arayüzlerin tasarlanması.</p></div>' +
    '<div class="step"><span class="n">03</span><h3>Yazılım & Kontrol</h3><p>Gömülü yazılım ve kontrol algoritmalarının geliştirilmesi.</p></div>' +
    '<div class="step"><span class="n">04</span><h3>Sistem Entegrasyonu</h3><p>Alt sistemlerin birlikte değerlendirilmesi.</p></div></div>';
  return innerHero('Projeler & AR-GE','Kamuya açık teknoloji tanıtımları ve mühendislik çalışma alanları.','research-lab.svg') +
    section(published+highlights) +
    section(research,'inner-panel') +
    section(process) +
    section(feature('Gömülü sistemlerin içinde.','DONANIM & YAZILIM','PCB tasarımı ve gömülü yazılımın uçuş elektroniğiyle kurduğu ilişkiyi inceleyin.','platform-systems.svg',false,'gomulu-sistemler.html','Gömülü Sistemler'),'inner-panel');
}
function news(){
  const posts = head(
    'ŞİRKET PAYLAŞIMLARI',
    'Teknoloji gündemi.',
    'İstikbal Aerospace’in kamuya açık teknoloji tanıtımlarından seçilen içerikler. Paylaşım ve duyurular ayrı kategorilerde izlenebilir.'
  );
  const filters = '<div class="listing-toolbar"><div class="filter-group">'+
    '<button type="button" class="filter" data-filter="all" aria-pressed="true">Tümü</button>'+
    '<button type="button" class="filter" data-filter="Paylaşım" aria-pressed="false">Paylaşımlar</button>'+
    '<button type="button" class="filter" data-filter="Duyuru" aria-pressed="false">Duyurular</button></div><span class="count">YAYINLAR</span></div>';
  const cards = '<div class="cards-3 filter-target">'+
    newsCard('Tengri AI: Yapay zekâ ve karar destek vizyonu','Paylaşım','tengri-network.svg','haber-detay.html','Şirketin Tengri AI tanıtımında ağ bağlantılı savunma sistemleri ve çok katmanlı yapay zekâ vizyonu anlatılıyor.')+
    newsCard('Yapay zekâ destekli yeni nesil uçuş kontrolcüsü','Paylaşım','platform-systems.svg','ucus-kontrol-paylasimi.html','Şirketin uçuş kontrol sistemlerine yönelik yapay zekâ ve kontrol algoritmaları odaklı teknoloji paylaşımı.')+
    '</div><p class="filter-empty editorial-note" hidden>Bu kategoride yayımlanmış bir içerik bulunmuyor.</p>';
  return innerHero('Haberler & Duyurular','İstikbal Aerospace’in kamuya açık açıklamaları ve teknoloji paylaşımları.','hero-hangar-photo.webp')+
    section(posts+filters+cards)+
    section(feature('Tengri AI hakkında daha fazla.','TEKNOLOJİ','Bağlantılı savunma sistemleri ve yapay zekâ vizyonunu teknoloji sayfasında inceleyin.','tengri-network.svg',false,'tengri-ai.html','Tengri AI'),'inner-panel');
}
function about(){
  const intro = head(
    'HAKKIMIZDA',
    'Fikirden çalışan sisteme.',
    'İstikbal Aerospace, Antalya / Kepez merkezli; havacılık, uzay ve savunma teknolojilerine yönelik alt sistemler, gömülü elektronik ve otonom yazılım çalışmalarına odaklanan bir teknoloji ve AR-GE girişimidir.'
  );
  const introduction = '<div class="split-feature"><div class="visual" ' + cardImg('research-lab.svg') + '></div><div class="copy">' +
    '<span class="eyebrow no-rule">MÜHENDİSLİK YAKLAŞIMI</span>' +
    '<h2>Donanım, yazılım ve otonomi bir arada.</h2>' +
    '<p>Elektronik tasarım, gömülü uçuş mimarileri ve otonom algoritmalar birbirinden bağımsız parçalar değildir. İstikbal Aerospace, kamuya açık kurumsal tanıtımında bu disiplinleri birlikte ele alan, çevik ve prototip geliştirmeye odaklı bir mühendislik yaklaşımı benimsediğini ifade eder.</p>' +
    '<p>Yaklaşımın odağında, kavramsal tasarımların donanım ve yazılımla buluşturulması; alt sistemlerin birlikte çalışabilir, incelenebilir ve test edilebilir yapılar olarak değerlendirilmesi bulunur.</p>' +
    btn('Kabiliyetleri İncele','kabiliyetler.html','outline') + '</div></div>';
  const workStages = head(
    'ÇALIŞMA YAKLAŞIMI',
    'Tasarım. Prototipleme. Entegrasyon.',
    'İstikbal Aerospace’in kamuya açık tanıtımında öne çıkan mühendislik süreçleri.'
  ) + '<div class="cards-3">' +
    techCard('Sistem Tasarımı','01','◇','Elektronik donanım, uçuş mimarileri ve yazılım bileşenlerini ortak bir sistem çerçevesinde değerlendirme.','ucus-mimarileri.html') +
    techCard('Hızlı Prototipleme','02','⌁','Kavramsal fikirlerin elektronik tasarım, gömülü yazılım ve algoritma geliştirmeyle somutlaştırılması.','gomulu-sistemler.html') +
    techCard('Entegrasyon','03','◎','Farklı bileşenler arasında veri akışı, kontrol ve sistem davranışının bütün olarak ele alınması.','teknolojiler.html') +
    '</div>';
  const disciplines = head(
    'FAALİYET ALANLARI',
    'Birbirini tamamlayan mühendislik alanları.',
    'Şirketin kamuya açık tanıtımlarında yer alan çalışma başlıklarını ilgili sayfalardan inceleyebilirsiniz.'
  ) + '<div class="cards-3">' +
    techCard('Gömülü Uçuş Sistemleri','01','▦','Hava araçları için donanım ve yazılım mimarilerinin tasarımı.','ucus-mimarileri.html') +
    techCard('Otonom Algoritmalar','02','⌁','Algılama, karar mekanizmaları ve otonom sistemlerin mühendislik temelleri.','otonom-sistemler.html') +
    techCard('Yapay Zekâ & Sistemler','03','◎','Tengri AI çevresinde ele alınan yapay zekâ destekli savunma ağı konseptleri.','tengri-ai.html') +
    '</div>';
  const location = '<div class="corporate-identity"><div><span class="eyebrow">KONUM</span>' +
    '<h2>Kepez, Antalya.</h2></div><div>' +
    '<p>İstikbal Aerospace’in kamuya açık şirket profilinde merkez konumu Kepez / Antalya olarak belirtilmektedir. İş birliği ve iletişim talepleri için iletişim sayfamıza ulaşabilirsiniz.</p>' +
    btn('İletişime Geç','iletisim.html','outline') + '</div></div>';
  return innerHero('Kurumsal','Havacılık, gömülü sistemler ve otonom yazılım odağında disiplinler arası mühendislik.','hero-hangar-photo.webp') +
    section(intro + introduction) +
    section(workStages,'inner-panel') +
    section(disciplines) +
    section(location);
}
function contact(){return `${innerHero('İletişim','İstikbal Aerospace ile iletişime geçin.','platform-systems.svg')}${section(`${head('İLETİŞİM','Birlikte iletişime geçelim.','Genel sorular, kurumsal iş birlikleri ve teknoloji alanları hakkında bilgi için.')}<div class="contact-grid"><div class="contact-infos"><div class="contact-line"><span>ŞİRKET</span><strong>İstikbal Aerospace</strong></div><div class="contact-line"><span>E-POSTA</span><strong><a href="mailto:abdullahdemiral@istikbalaerospace.com">abdullahdemiral@istikbalaerospace.com</a></strong></div><div class="contact-line"><span>TELEFON</span><strong><a href="tel:+905462781931">+90 546 278 19 31</a></strong></div><div class="contact-line"><span>KONUM</span><strong>Kepez, Antalya / Türkiye</strong></div><p class="small muted" style="margin-top:29px">İletişim formu henüz sunucuya bağlı değildir. Doğrudan e-posta veya telefon yoluyla ulaşabilirsiniz.</p></div><form id="contact-form" class="form-shell"><div class="form-grid"><div class="field"><label for="name">AD SOYAD</label><input id="name" name="name" autocomplete="name" placeholder="Adınız Soyadınız" required></div><div class="field"><label for="email">E-POSTA</label><input id="email" name="email" type="email" autocomplete="email" placeholder="ornek@eposta.com" required></div><div class="field wide"><label for="topic">KONU</label><select id="topic" required><option value="">Konu seçiniz</option><option>Genel iletişim</option><option>Kurumsal iş birliği</option><option>Diğer</option></select></div><div class="field wide"><label for="message">MESAJINIZ</label><textarea id="message" name="message" placeholder="Mesajınızı buraya yazın..." required></textarea></div></div><p class="form-note">Bu form şu anda mesaj göndermiyor. Göndermek için yukarıdaki doğrudan iletişim bilgilerini kullanın.</p><button class="btn solid" type="submit">Formu Kontrol Et <span class="arrow">↗</span></button><div id="form-message" class="form-message" role="status" aria-live="polite"></div></form></div>`)}` }
function detail(type){
  if(type==='newsDetail'){
    const post='https://tr.linkedin.com/posts/i%CC%87stikbal-aerospace_tengriai-defenseai-savunmasanayi-activity-7370532002627878912-WIXo';
    const content='<article class="article"><span class="eyebrow no-rule">ŞİRKETİN KAMUYA AÇIK PAYLAŞIMI</span>'+
      '<h2>Tengri AI ve bağlantılı savunma sistemleri.</h2>'+
      '<p>İstikbal Aerospace, Tengri AI tanıtımında çok katmanlı yapay zekâ, tehdit değerlendirme, hava ve kara sistemleri arasında koordinasyon ve ağ tabanlı karar desteği hedeflerini paylaştı.</p>'+
      '<div class="article-img" '+cardImg('tengri-network.svg')+'></div>'+
      '<h2>Teknoloji vizyonu</h2>'+
      '<p>Sensör verilerinin bir araya getirilmesi, çoklu hedeflerin değerlendirilmesi ve bilgi paylaşımı, tanıtımda öne çıkan ana başlıklardır. Açıklanan konseptler doğrulanmış operasyonel performans bilgisi olarak sunulmamaktadır.</p>'+
      '<p><a href="'+post+'" target="_blank" rel="noopener noreferrer" class="text-link">Orijinal LinkedIn paylaşımı ↗</a></p>'+
      btn('Tengri AI','tengri-ai.html','solid')+'　'+btn('Tüm Yayınlar','haberler.html')+'</article>';
    return innerHero('Tengri AI','Yapay zekâ destekli savunma ağı yaklaşımı üzerine şirket paylaşımı.','tengri-network.svg','HABERLER / TENGRİ AI','İSTİKBAL AEROSPACE')+section(content);
  }
  if(type==='flightControlNews'){
    const content='<article class="article"><span class="eyebrow no-rule">KAMUYA AÇIK TEKNOLOJİ TANITIMI</span>'+
      '<h2>Yapay zekâ ile entegre uçuş kontrolü.</h2>'+
      '<p>İstikbal Aerospace’in LinkedIn üzerinden paylaşılan yeni nesil uçuş kontrolcüsü tanıtımında, yapay zekâ destekli kontrol algoritmaları ve uçuş sistemlerinde güvenlik ile verimlilik hedefleri öne çıkarılıyor.</p>'+
      '<div class="article-img" '+cardImg('platform-systems.svg')+'></div>'+
      '<h2>Mühendislik yaklaşımı</h2>'+
      '<p>Uçuş elektroniği; gömülü işlem birimleri, sensör verileri, kontrol yazılımı ve geri bildirim mekanizmalarını bir araya getirir. Bu tanıtım, doğrulanmış test sonuçları veya sertifikasyon bilgisi içermediğinden performans değerleri yayımlanmamaktadır.</p>'+
      '<p>Şirketin kamuya açık paylaşımı LinkedIn faaliyetinde yer almakta; tam yayın tarihi ve ayrıntılı teknik dokümanları henüz doğrulanmamıştır.</p>'+
      btn('Gömülü Uçuş Mimarileri','ucus-mimarileri.html','solid')+'　'+btn('Tüm Yayınlar','haberler.html')+'</article>';
    return innerHero('Uçuş Kontrolcüsü','Yapay zekâ ile entegre yeni nesil uçuş kontrolcüsü tanıtımı.','platform-systems.svg','HABERLER / UÇUŞ KONTROLCÜSÜ','İSTİKBAL AEROSPACE')+section(content);
  }
  const d=type==='platformDetail'?['Havacılık Sistemleri','Platform mühendisliği, uçuş elektroniği ve sistem entegrasyonu.','platform-flight.svg','iha-sistemleri.html']:['AR-GE','Elektronik tasarım ve otonom mühendislik çalışmaları.','research-lab.svg','projeler.html'];
  return innerHero(d[0],d[1],d[2])+section(feature('Mühendislik disiplinleri.','SİSTEM ALANLARI','İstikbal Aerospace’in gömülü donanım, otonom sistemler ve mühendislik çalışmalarını daha ayrıntılı keşfedin.',d[2],false,d[3],'Devamını İncele'));
}
const focusData={
 autonomy:{title:'Otonom Sistemler',kicker:'SİSTEM MÜHENDİSLİĞİ / 01',tagline:'Algılama, karar verme ve kontrolün buluştuğu alan.',bg:'platform-flight.svg',intro:'Otonom sistemler; çevreyi algılama, veriyi yorumlama ve belirlenen hedeflere göre hareket üretme gibi farklı mühendislik disiplinlerini bir araya getirir. Bu sayfa, konunun genel yaklaşımını tanıtır.',modules:[['01','Algılama ve veri','Sensörlerden gelen verilerin sistem tarafından yorumlanmasına yönelik mühendislik yaklaşımı.'],['02','Karar mekanizmaları','Algılanan duruma göre kuralların ve algoritmaların rolünü açıklayan genel çerçeve.'],['03','Kontrol ve geri bildirim','Ölçüm, kontrol ve geri bildirim döngülerinin sistem tasarımındaki yeri.']],related:'Gömülü Sistemler',to:'gomulu-sistemler.html'},
 embedded:{title:'Gömülü Sistemler',kicker:'DONANIM & YAZILIM / 02',tagline:'Donanımla yazılımın birlikte düşünüldüğü sistemler.',bg:'platform-systems.svg',intro:'Gömülü sistem geliştirme; işlem birimi, çevre birimleri, yazılım ve haberleşme arayüzlerinin birlikte ele alınmasını gerektirir. Buradaki başlıklar teknik yaklaşımın genel bir açıklamasıdır.',modules:[['01','Elektronik mimari','Elektronik bileşenlerin işlevsel bir sistem içinde düzenlenmesine dair temel yaklaşım.'],['02','Gömülü yazılım','Donanım kaynaklarını yöneten ve sistem davranışını tanımlayan yazılım katmanı.'],['03','Entegrasyon ve test','Donanım ve yazılımın birlikte değerlendirilmesi, arayüzlerin doğrulanması.']],related:'Sensör Füzyonu',to:'sensor-fuzyonu.html'},
 sensors:{title:'Sensör Füzyonu',kicker:'ALGILAMA & ENTEGRASYON / 03',tagline:'Birden fazla veri kaynağından daha tutarlı bir tablo.',bg:'tengri-network.svg',intro:'Sensör füzyonu, farklı algılayıcılardan elde edilen bilgilerin değerlendirilerek birlikte kullanılmasına yönelik mühendislik alanıdır. Açıklamalar genel teknoloji tanıtımıdır; şirkete özgü performans iddiası içermez.',modules:[['01','Veri kaynakları','Farklı ölçümlerin nitelikleri, zamanlaması ve kullanılabilirliği.'],['02','Birleştirme yaklaşımı','Farklı kaynaklardan gelen bilgilerin karşılaştırılması ve birlikte ele alınması.'],['03','Sistem ilişkileri','Algılama katmanının otonomi ve gömülü sistemlerle bağlantısı.']],related:'Otonom Sistemler',to:'otonom-sistemler.html'}
 ,
 rockets:{title:'Roket Sistemleri',kicker:'HAVACILIK & UZAY / 04',tagline:'Uçuş elektroniği, telemetri ve sistem bütünlüğü.',bg:'platform-flight.svg',intro:'Roket sistemleri, İstikbal Aerospace’in kamuya açık uzmanlık alanları listesinde geçmektedir. Bu sayfa roket projelerinde ele alınan genel mühendislik disiplinlerini tanıtır; şirkete ait belirli bir ürün, uçuş testi veya performans iddiası içermez.',modules:[['01','Uçuş elektroniği','Algılama, kontrol ve uçuş bilgisinin değerlendirilmesinde elektronik bileşenlerin genel rolü.'],['02','Telemetri ve haberleşme','Sistem verilerinin izlenmesi ve bağlantılı birimlerle bilgi alışverişi.'],['03','Entegrasyon ve doğrulama','Elektronik, yazılım ve mekanik alt sistemlerin bütün halinde ele alınması.']],related:'Gömülü Uçuş Mimarileri',to:'ucus-mimarileri.html'},
 communications:{title:'İleri Haberleşme',kicker:'VERİ BAĞLANTILARI / 05',tagline:'Bağlantılı sistemler arasında bilgi akışı ve entegrasyon.',bg:'tengri-network.svg',intro:'İstikbal Aerospace’in kamuya açık şirket özetinde haberleşme sistemleri ve şifreli taktik veri bağlantıları çalışma alanları arasında anılmaktadır. Burada haberleşme mimarilerinin genel ilkeleri yer alır; doğrulanmamış teknik uygulama, kapasite veya operasyonel ürün iddiası sunulmaz.',modules:[['01','Veri iletimi','Bağlantılı platformlar arasında durum ve ölçüm bilgilerinin aktarılmasına dair temel yaklaşım.'],['02','Güvenlik ve bütünlük','İletilen bilginin güvenliğinin ve tutarlılığının sistem tasarımında değerlendirilmesi.'],['03','Sistem entegrasyonu','Haberleşme katmanının sensörler, gömülü yazılım ve üst sistemlerle birlikte ele alınması.']],related:'Sensör Füzyonu',to:'sensor-fuzyonu.html'}
};
function focusPage(key){const x=focusData[key];return `${innerHero(x.title,x.tagline,x.bg,'TEKNOLOJİLER / '+x.title.toUpperCase(),x.kicker)}${section(`<div class="focus-intro"><div><span class="eyebrow">TEKNOLOJİYE YAKINDAN BAKIŞ</span><h2>Bir disiplinin farklı katmanları.</h2></div><p>${x.intro}</p></div>`)}${section(`${head('TEMEL YAKLAŞIM','Mühendislik bileşenleri.','Konuya ait kavramlar ve çalışma ilkeleri; doğrulanmış proje bilgileri ayrıca yayınlanacaktır.')}<div class="focus-modules">${x.modules.map(([num,title,copy])=>`<article class="focus-module"><span class="num">${num} / 03</span><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div>`,'inner-panel')}${section(`${feature('Sistemler birlikte çalışır.','İLİŞKİLİ TEKNOLOJİLER','Teknoloji başlıkları birbirinden kopuk değildir. İlgili alanları ve şirketin diğer mühendislik disiplinlerini keşfedin.',x.bg,false,x.to,x.related)}`)}${section(`${head('DAHA FAZLASINI KEŞFET','Teknoloji haritasına dönün.','Tüm çalışma alanlarını bir arada görün ve Tengri AI ile Kabiliyetler bölümlerine ulaşın.',btn('Tüm Teknolojiler','teknolojiler.html','solid'))}`)}`}

const platformDetails={"iha": ["İnsansız Hava Sistemleri", "Hava platformları, otonom uçuş ve sistem mühendisliği.", "hero-hangar-photo.webp", "İNSANSIZ HAVA SİSTEMLERİ", "İnsansız hava araçları; gövde, elektronik, uçuş kontrolü, haberleşme ve sensör sistemlerinin birlikte çalışmasını gerektiren bütünleşik platformlardır.", "Uçuş elektroniği", "Uçuş kontrolü ve gömülü sistemler ile platform yönetimi.", "Otonom hareket", "Sensör verileri, karar mekanizmaları ve kontrol katmanları.", "Haberleşme", "Verinin platform bileşenleri arasında ve bağlantılı sistemlerde iletilmesi."], "flightArch": ["Gömülü Uçuş Mimarileri", "Donanım ve yazılımın birlikte geliştirildiği uçuş sistemleri.", "platform-systems.svg", "GÖMÜLÜ UÇUŞ MİMARİSİ", "Uçuş sistemlerinde gömülü mimari; kart tasarımı, işlem birimi, çevre birimleri, veri arabirimleri ve kontrol yazılımının birlikte değerlendirilmesini gerektirir.", "Elektronik tasarım", "PCB ve temel elektronik bileşenlerin sistem ihtiyaçlarına göre ele alınması.", "Gömülü yazılım", "Donanım kaynakları, zamanlama ve sistem davranışı.", "Entegrasyon", "Bileşenlerin bütünleşik yapı içinde çalışmasının değerlendirilmesi."], "airDefense": ["Hava Savunma Ağları", "Algılama, bağlantı ve karar destek yaklaşımı.", "tengri-network.svg", "AĞ BAĞLANTILI SİSTEMLER", "İstikbal Aerospace’in kamuya açık açıklamalarında hava savunma ağları ve yapay zekâ destekli koordinasyon yaklaşımları çalışma alanları arasında yer alır.", "Algılama", "Farklı veri kaynaklarından durumsal bilgi elde etme yaklaşımı.", "Veri bağlantısı", "Bağlı sistemler arasında haberleşme ve bilgi akışı.", "Karar desteği", "Tengri AI başlığıyla ilişkili değerlendirme ve koordinasyon katmanları."]};
function platformFocus(key){const d=platformDetails[key];return `${innerHero(d[0],d[1],d[2],'PLATFORMLAR / '+d[0].toUpperCase(),d[3])}${section(`<div class="focus-intro"><div><span class="eyebrow">SİSTEM ODAĞI</span><h2>Birlikte çalışan teknolojiler.</h2></div><p>${d[4]}</p></div>`)}${section(`${head('MÜHENDİSLİK KATMANLARI','Sistem bütünlüğü.','Havacılık çalışmalarında birbirini tamamlayan temel mühendislik başlıkları.')}<div class="focus-modules">${[[d[5],d[6]],[d[7],d[8]],[d[9],d[10]]].map(([t,desc],i)=>`<article class="focus-module"><span class="num">0${i+1} / 03</span><h3>${t}</h3><p>${desc}</p></article>`).join('')}</div>`,'inner-panel')}${section(`${feature('Teknolojilere daha yakından bakın.','TEKNOLOJİLER','Otonom sistemler, gömülü donanım ve sensör füzyonu üzerine mühendislik alanlarını keşfedin.',d[2],false,'teknolojiler.html','Tüm Teknolojiler')}`)}`}
const titles={iha:'İnsansız Hava Sistemleri',flightArch:'Gömülü Uçuş Mimarileri',airDefense:'Hava Savunma Ağları',autonomy:'Otonom Sistemler',embedded:'Gömülü Sistemler',sensors:'Sensör Füzyonu',rockets:'Roket Sistemleri',communications:'İleri Haberleşme',home:'Ana Sayfa',platforms:'Platformlar',tech:'Teknolojiler',capabilities:'Kabiliyetler',tengri:'Tengri AI',projects:'Projeler & AR-GE',news:'Haberler & Duyurular',about:'Kurumsal',contact:'İletişim',platformDetail:'Platform Detayı',projectDetail:'Proje Detayı',newsDetail:'Haber Detayı',flightControlNews:'Uçuş Kontrolcüsü'};
const pages={iha:()=>platformFocus('iha'),flightArch:()=>platformFocus('flightArch'),airDefense:()=>platformFocus('airDefense'),autonomy:()=>focusPage('autonomy'),embedded:()=>focusPage('embedded'),sensors:()=>focusPage('sensors'),rockets:()=>focusPage('rockets'),communications:()=>focusPage('communications'),home:homepage,platforms,tech:technologies,capabilities,tengri,projects,news,about,contact,platformDetail:()=>detail('platformDetail'),projectDetail:()=>detail('projectDetail'),newsDetail:()=>detail('newsDetail'),flightControlNews:()=>detail('flightControlNews')};
document.title=`${titles[page]||'Ana Sayfa'} | İstikbal Aerospace`;
document.querySelector('#app').innerHTML=header()+`<main id="main" tabindex="-1">${(pages[page]||homepage)()}</main>`+footer();
// The technology trigger is a disclosure. Only real links can revisit a document.
const siteHeader = document.querySelector('.site-header');
const techTrigger = document.getElementById('tech-trigger');
const platformNavTrigger = document.getElementById('platform-trigger');
const platformMenu = document.getElementById('platform-menu');
const megaMenu = document.getElementById('mega-menu');
const mobileTrigger = document.getElementById('mobile-trigger');
const mobileMenu = document.getElementById('mobile-nav');
const mobileTech = document.getElementById('mobile-tech');
const mobilePlatform = document.getElementById('mobile-platform');
const mobilePlatformSub = document.getElementById('mobile-platform-sub');
const mobileSub = document.getElementById('mobile-sub');
const mobileLayout = matchMedia('(max-width: 960px)');

function setMega(open) {
  if (open) { platformMenu.classList.remove('open'); platformNavTrigger.setAttribute('aria-expanded','false'); }
  megaMenu.classList.toggle('open', open);
  techTrigger.setAttribute('aria-expanded', String(open));
}
function setPlatformMega(open) {
  if (open) { megaMenu.classList.remove('open'); techTrigger.setAttribute('aria-expanded','false'); }
  platformMenu.classList.toggle('open', open);
  platformNavTrigger.setAttribute('aria-expanded', String(open));
}
function setMobile(open) {
  mobileMenu.classList.toggle('open', open);
  mobileTrigger.setAttribute('aria-expanded', String(open));
  mobileTrigger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  if (!open) {
    mobileSub.hidden = true;
    mobileTech.setAttribute('aria-expanded', 'false');
    mobilePlatformSub.hidden = true;
    mobilePlatform.setAttribute('aria-expanded', 'false');
    mobileMenu.scrollTop = 0;
  }
}
function closeMenus() {
  setPlatformMega(false);
  setMega(false);
  setMobile(false);
}
const platformHoverArea = platformNavTrigger.closest('.platform-current') || platformNavTrigger;
platformHoverArea.addEventListener('pointerenter', event => {
  if (event.pointerType === 'mouse') setPlatformMega(true);
});
platformNavTrigger.addEventListener('click', event => {
  const open = event.detail > 0 || !platformMenu.classList.contains('open');
  setPlatformMega(open);
  if (open && event.detail === 0) platformMenu.querySelector('a')?.focus({preventScroll: true});
});
platformNavTrigger.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    setPlatformMega(true);
    platformMenu.querySelector('a')?.focus({preventScroll: true});
  }
});
document.querySelector('.close-platform').addEventListener('click', () => {
  setPlatformMega(false);
  platformNavTrigger.focus({preventScroll: true});
});
mobilePlatform.addEventListener('click', () => {
  mobilePlatformSub.hidden = !mobilePlatformSub.hidden;
  mobilePlatform.setAttribute('aria-expanded', String(!mobilePlatformSub.hidden));
  if (!mobilePlatformSub.hidden) { mobileSub.hidden = true; mobileTech.setAttribute('aria-expanded','false'); }
});
const techHoverArea = techTrigger.closest('.tech-current') || techTrigger;
techHoverArea.addEventListener('pointerenter', event => {
  if (event.pointerType === 'mouse') setMega(true);
});
techTrigger.addEventListener('click', event => {
  // Hover has already opened the panel for a mouse click.
  const open = event.detail > 0 || !megaMenu.classList.contains('open');
  setMega(open);
  if (open && event.detail === 0) megaMenu.querySelector('a').focus({preventScroll: true});
});
techTrigger.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    setMega(true);
    megaMenu.querySelector('a').focus({preventScroll: true});
  }
});
siteHeader.addEventListener('pointerleave', event => {
  if (event.pointerType === 'mouse' && !megaMenu.contains(document.activeElement) && !platformMenu.contains(document.activeElement)) { setMega(false); setPlatformMega(false); }
});
siteHeader.addEventListener('focusout', event => {
  if (event.relatedTarget && !siteHeader.contains(event.relatedTarget)) closeMenus();
});
document.getElementById('close-mega').addEventListener('click', () => {
  setMega(false);
  techTrigger.focus({preventScroll: true});
});
mobileTrigger.addEventListener('click', () => setMobile(!mobileMenu.classList.contains('open')));
mobileTech.addEventListener('click', () => {
  mobileSub.hidden = !mobileSub.hidden;
  mobileTech.setAttribute('aria-expanded', String(!mobileSub.hidden));
  if (!mobileSub.hidden) { mobilePlatformSub.hidden = true; mobilePlatform.setAttribute('aria-expanded','false'); }
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (mobileMenu.classList.contains('open')) mobileTrigger.focus({preventScroll: true});
  else if (megaMenu.classList.contains('open')) techTrigger.focus({preventScroll: true});
  else if (platformMenu.classList.contains('open')) platformNavTrigger.focus({preventScroll: true});
  closeMenus();
});
document.addEventListener('pointerdown', event => {
  if (!siteHeader.contains(event.target)) closeMenus();
});
mobileLayout.addEventListener('change', closeMenus);
window.addEventListener('pageshow', closeMenus);

// Lightweight working category filter on the example project/news pages.
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{const group=b.closest('.listing-toolbar');group.querySelectorAll('.filter').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const key=b.dataset.filter,list=group.nextElementSibling;let shown=0;list.querySelectorAll('[data-category]').forEach(card=>{card.hidden=key!=='all'&&card.dataset.category!==key;if(!card.hidden)shown++;});const empty=list.parentElement.querySelector('.filter-empty');if(empty)empty.hidden=shown!==0;}));
// Local-only form demo; never transmit or store anything.
const cf=document.getElementById('contact-form');if(cf)cf.addEventListener('submit',e=>{e.preventDefault();document.getElementById('form-message').textContent='Alanlar kontrol edildi. Mesaj gönderilmedi; lütfen e-posta veya telefon ile iletişime geçin.';cf.reset()});
