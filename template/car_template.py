# TEMPLATE GAYA CAROUSEL (1080x1080, terang, kontras tinggi). Ganti isi slide, pertahankan aturan kontras dan ukuran huruf.
from PIL import Image, ImageDraw, ImageFont
import glob
B=glob.glob('/usr/share/fonts/**/DejaVuSans-Bold.ttf',recursive=True)[0]
R=glob.glob('/usr/share/fonts/**/DejaVuSans.ttf',recursive=True)[0]
W=H=1080
BG=(250,249,246); INK=(28,34,48); MUT=(68,78,94); ACC=(196,92,10); GRN=(38,150,110); BLU=(40,110,230); LINE=(225,228,234); SOFT=(255,240,225)
F=lambda p,s:ImageFont.truetype(p,s)
def wrap(d,t,f,w):
    out=[];l=''
    for wd in t.split():
        c=(l+' '+wd).strip()
        if d.textlength(c,font=f)<=w:l=c
        else:out.append(l);l=wd
    out.append(l);return out
def base(i,n,h,body,src,hs=60):
    im=Image.new('RGB',(W,H),BG);d=ImageDraw.Draw(im)
    d.text((80,55),"@yg_lagitrend",font=F(B,30),fill=INK)
    d.text((W-80,55),f"{i}/{n}",font=F(B,28),fill=ACC,anchor='ra')
    y=130;hf=F(B,hs)
    for l in wrap(d,h,hf,920):d.text((80,y),l,font=hf,fill=INK);y+=int(hs*1.28)
    y+=8;bf=F(R,38)
    for l in wrap(d,body,bf,920):d.text((80,y),l,font=bf,fill=(52,60,75));y+=54
    d.line([80,1000,W-80,1000],fill=LINE,width=3)
    if src:d.text((80,1030),src,font=F(R,28),fill=MUT)
    if i<n and (not src or d.textlength(src,font=F(R,28))<700):d.text((W-80,1030),"geser",font=F(B,30),fill=ACC,anchor='ra')
    return im,d,y
def bars(d,items,top=650,h=300,unit=""):
    mx=max(v for _,v,_,_ in items);bw=300;gap=120;x0=(W-(len(items)*bw+(len(items)-1)*gap))//2
    for k,(lab,v,col,txt) in enumerate(items):
        x=x0+k*(bw+gap);bh=int(h*0.78*v/mx);y=top+h-bh
        d.rounded_rectangle([x,y,x+bw,top+h],radius=14,fill=col)
        d.text((x+bw//2,y-18),txt,font=F(B,34),fill=INK,anchor='ms')
        d.text((x+bw//2,top+h+30),lab,font=F(B,28),fill=MUT,anchor='ms')
def wheat(d,cx,cy,s=1,col=ACC):
    d.line([cx,cy+70*s,cx,cy-60*s],fill=col,width=int(6*s))
    for k in range(4):
        y=cy-50*s+k*28*s
        d.ellipse([cx-34*s,y-10*s,cx-6*s,y+10*s],fill=col);d.ellipse([cx+6*s,y-10*s,cx+34*s,y+10*s],fill=col)
    d.ellipse([cx-9*s,cy-82*s,cx+9*s,cy-52*s],fill=col)
def cross(d,cx,cy,s=1,col=GRN):
    d.rounded_rectangle([cx-20*s,cy-60*s,cx+20*s,cy+60*s],radius=int(8*s),fill=col);d.rounded_rectangle([cx-60*s,cy-20*s,cx+60*s,cy+20*s],radius=int(8*s),fill=col)
def bolt(d,cx,cy,s=1,col=BLU):
    d.polygon([(cx+10*s,cy-75*s),(cx-40*s,cy+10*s),(cx-5*s,cy+10*s),(cx-15*s,cy+75*s),(cx+40*s,cy-15*s),(cx+5*s,cy-15*s)],fill=col)
n=7;S='Sumber: '
# 1
im,d,y=base(1,n,"Bisnis apa yang akan selalu ramai sampai 50 tahun ke depan?","Jawabannya bukan soal tren. Cari kebutuhan yang tidak hilang walau zaman berganti.","",hs=68)
for cx,fn in [(240,wheat),(540,cross),(840,bolt)]:
    d.ellipse([cx-110,720-110+60,cx+110,720+110+60],fill=SOFT if fn is wheat else (232,244,238) if fn is cross else (232,240,255));fn(d,cx,780,1.3)
im.save('/home/claude/out_carousel/s1.png')
# 2
im,d,y=base(2,n,"Cara menilainya","Ini analisis tren, bukan ramalan pasti. Tiga ukuran sederhana:","")
for k,t in enumerate(["Dibutuhkan semua orang, bukan hanya satu kelompok","Jumlah penggunanya terus bertambah","Sulit digantikan teknologi sepenuhnya"]):
    yy=500+k*150;d.rounded_rectangle([80,yy,1000,yy+120],radius=24,fill=(255,255,255),outline=LINE,width=3)
    d.ellipse([110,yy+25,180,yy+95],fill=ACC);d.text((145,yy+60),str(k+1),font=F(B,36),fill=(255,255,255),anchor='mm')
    for j,l in enumerate(wrap(d,t,F(B,30),760)):d.text((210,yy+38+j*38 if len(wrap(d,t,F(B,30),760))>1 else yy+60),l,font=F(B,30),fill=INK,anchor='lm' if len(wrap(d,t,F(B,30),760))==1 else 'la')
im.save('/home/claude/out_carousel/s2.png')
# 3
im,d,y=base(3,n,"1. Pangan","Menurut proyeksi FAO (2009), produksi pangan dunia perlu naik sekitar 70 persen pada 2050 dibanding 2005/07 untuk memberi makan penduduk yang bertambah.","Sumber: FAO, How to Feed the World in 2050 (proyeksi 2009)")
bars(d,[("2005/07",100,(196,204,216),"100"),("2050 (proyeksi)",170,ACC,"170")],top=y+60,h=980-y-80-60)
d.text((W//2,y+30),"indeks produksi pangan",font=F(B,28),fill=MUT,anchor='mm')
wheat(d,W//2,y+170,0.9)
im.save('/home/claude/out_carousel/s3.png')
# 4
im,d,y=base(4,n,"2. Kesehatan dan perawatan lansia","PBB memproyeksikan orang berusia 65 tahun ke atas naik dari sekitar 857 juta (2025) menjadi sekitar 1,58 miliar pada 2050, atau sekitar 16 persen penduduk dunia.","Sumber: PBB (UN DESA), World Population Prospects")
bars(d,[("2025",857,(196,204,216),"857 juta"),("2050 (proyeksi)",1580,GRN,"1,58 miliar")],top=y+60,h=980-y-80-60)
cross(d,W//2,y+170,0.8)
im.save('/home/claude/out_carousel/s4.png')
# 5
im,d,y=base(5,n,"3. Listrik dan energi","IEA mencatat permintaan listrik tumbuh jauh lebih cepat dari total energi. Pada skenario kebijakan saat ini, kebutuhan listrik dunia bisa hampir dua kali lipat pada 2050.","Sumber: IEA, World Energy Outlook 2025 (skenario STEPS)")
bars(d,[("2023",26000,(196,204,216),"26.000 TWh"),("2050 (proyeksi)",50000,BLU,"50.000 TWh")],top=y+60,h=980-y-80-60)
bolt(d,W//2,y+170,0.8)
im.save('/home/claude/out_carousel/s5.png')
# 6
im,d,y=base(6,n,"Catatan penting","Bisnis di bidang yang ramai belum tentu mudah atau pasti untung. Persaingan, modal, izin, dan cara menjalankannya tetap menentukan.","Ini bukan saran keuangan atau investasi.")
d.polygon([(540,560),(400,830),(680,830)],outline=ACC,width=10,fill=SOFT);d.text((540,740),"!",font=F(B,110),fill=ACC,anchor='mm')
d.text((80,900),"Lakukan riset sendiri dan hitung modal sebelum mulai.",font=F(B,30),fill=INK)
im.save('/home/claude/out_carousel/s6.png')
# 7
im,d,y=base(7,n,"Kalau harus pilih satu, kamu pilih yang mana?","Pangan, kesehatan, atau listrik? Tulis alasanmu di komentar.","Sumber: FAO, PBB (UN DESA), IEA")
for cx,fn,lab,c in [(240,wheat,"Pangan",SOFT),(540,cross,"Kesehatan",(232,244,238)),(840,bolt,"Listrik",(232,240,255))]:
    d.ellipse([cx-110,610,cx+110,830],fill=c);fn(d,cx,720,1.3);d.text((cx,880),lab,font=F(B,34),fill=INK,anchor='mm')
im.save('/home/claude/out_carousel/s7.png')
