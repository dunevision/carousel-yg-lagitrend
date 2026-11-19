from PIL import Image, ImageDraw, ImageFont
import glob,math
B=[f for f in glob.glob('/usr/share/fonts/**/DejaVuSans-Bold.ttf',recursive=True)][0]
R=[f for f in glob.glob('/usr/share/fonts/**/DejaVuSans.ttf',recursive=True)][0]
W,H=1080,1350
BG=(250,249,246); INK=(28,34,48); MUT=(110,118,132); ACC=(40,120,255); GRN=(38,170,110); LINE=(225,228,234); SOFT=(235,242,255)
def F(p,s): return ImageFont.truetype(p,s)
def wrap(d,t,f,w):
    out=[];l=''
    for wd in t.split():
        c=(l+' '+wd).strip()
        if d.textlength(c,font=f)<=w: l=c
        else: out.append(l); l=wd
    out.append(l); return out
def phone(d,x,y,w,h,fill=(255,255,255)):
    d.rounded_rectangle([x,y,x+w,y+h],radius=w//6,fill=fill,outline=INK,width=6)
    d.rounded_rectangle([x+w//2-w//7,y+h//30,x+w//2+w//7,y+h//30+h//40],radius=8,fill=INK)
def battery(d,x,y,w,h,pct,col=GRN):
    d.rounded_rectangle([x,y,x+w,y+h],radius=h//4,outline=INK,width=6,fill=(255,255,255))
    d.rounded_rectangle([x+w+4,y+h//3,x+w+18,y+2*h//3],radius=4,fill=INK)
    iw=int((w-20)*pct/100)
    d.rounded_rectangle([x+10,y+10,x+10+iw,y+h-10],radius=h//5,fill=col)
def ring(d,cx,cy,r,pct,col=GRN,wd=34):
    d.ellipse([cx-r,cy-r,cx+r,cy+r],outline=LINE,width=wd)
    d.arc([cx-r,cy-r,cx+r,cy+r],-90,-90+360*pct/100,fill=col,width=wd)
def chip(d,x,y,t,f,fill=SOFT,tc=ACC):
    w=d.textlength(t,font=f)+60; d.rounded_rectangle([x,y,x+w,y+84],radius=42,fill=fill)
    d.text((x+30,y+42),t,font=f,fill=tc,anchor='lm'); return x+w
def arrow(d,x,y):
    d.line([x,y,x+50,y],fill=MUT,width=6); d.polygon([(x+50,y-14),(x+72,y),(x+50,y+14)],fill=MUT)
def base(i,n,h,body,note=None,src=True):
    im=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(im)
    d.text((80,70),"@yg_lagitrend",font=F(R,32),fill=MUT)
    d.text((W-80,70),f"{i}/{n}",font=F(B,32),fill=ACC,anchor='ra')
    y=170;hf=F(B,64)
    for l in wrap(d,h,hf,920): d.text((80,y),l,font=hf,fill=INK); y+=82
    y+=15;bf=F(R,40)
    for l in wrap(d,body,bf,920): d.text((80,y),l,font=bf,fill=MUT); y+=58
    if note:
        y+=10
        for l in wrap(d,note,F(R,34),920): d.text((80,y),l,font=F(R,34),fill=MUT); y+=50
    d.line([80,H-95,W-80,H-95],fill=LINE,width=3)
    d.text((80,H-60),"Sumber: Apple Support (per November 2026)" if src else "",font=F(R,28),fill=MUT)
    if i<n: d.text((W-80,H-60),"geser",font=F(B,28),fill=ACC,anchor='ra')
    return im,d
n=6;out=[]
# 1
im,d=base(1,n,"Pengguna iPhone 15 ke atas: ada pengaturan baterai yang jarang disentuh","Namanya batas pengisian. Ini cara kerjanya.")
phone(d,380,690,320,520); battery(d,430,860,200,90,80); d.text((530,1040),"80%",font=F(B,70),fill=GRN,anchor='mm')
ring(d,200,950,110,80); ring(d,880,950,110,80,ACC)
im.save('/home/claude/car1/s1.png')
# 2
im,d=base(2,n,"Jalurnya","Buka Settings, lalu Battery, lalu Charging. Di sana kamu bisa memilih batas pengisian antara 80 sampai 100 persen, kelipatan 5 persen.")
x=80;f=F(B,38)
x=chip(d,x,800,"Settings",f);arrow(d,x+15,842);x=chip(d,x+110,800,"Battery",f)
x2=80;x2=chip(d,x2,930,"Charging",f,fill=(232,247,240),tc=GRN)
for k,p in enumerate([80,85,90,95,100]):
    cx=140+k*200; d.ellipse([cx-50,1080,cx+50,1180],fill=GRN if p==80 else (255,255,255),outline=GRN if p==80 else LINE,width=5)
    d.text((cx,1130),str(p),font=F(B,34),fill=(255,255,255) if p==80 else MUT,anchor='mm')
im.save('/home/claude/car1/s2.png')
# 3
im,d=base(3,n,"Apa yang terjadi kalau batas dipasang","iPhone berhenti mengisi di sekitar angka itu. Pengisian lanjut lagi kalau baterai turun lebih dari 5 persen saat masih tersambung.")
d.line([100,1100,980,1100],fill=LINE,width=4)
pts=[(100,1080),(400,800),(640,740),(900,740)]
d.line(pts[:3],fill=GRN,width=10); d.line([pts[2],(980,740)],fill=GRN,width=10)
d.line([(640,740),(640,1100)],fill=LINE,width=3); d.text((640,1130),"berhenti di 80%",font=F(R,30),fill=MUT,anchor='ma')
d.text((100,700),"100%",font=F(R,30),fill=MUT); d.text((100,1130),"mulai ngecas",font=F(R,30),fill=MUT)
im.save('/home/claude/car1/s3.png')
# 4
im,d=base(4,n,"Satu catatan","Kalau batas di bawah 100 persen, sesekali iPhone tetap mengisi sampai penuh supaya estimasi baterainya tetap akurat.","Itu normal, bukan error.")
battery(d,260,780,520,200,100,ACC)
cx,cy,r=540,1130,60
d.arc([cx-r,cy-r,cx+r,cy+r],30,300,fill=ACC,width=12); d.polygon([(cx+50,cy-48),(cx+85,cy-10),(cx+30,cy-8)],fill=ACC)
im.save('/home/claude/car1/s4.png')
# 5
im,d=base(5,n,"Menu ini untuk model mana?","iPhone 15 dan model setelahnya. Di iPhone 14 ke bawah, pengaturannya ada di Settings, Battery, Battery Health & Charging.")
for k,(t,c) in enumerate([("iPhone 15\nke atas",GRN),("iPhone 14\nke bawah",MUT)]):
    x=170+k*470; phone(d,x,860,240,380,fill=(255,255,255)); d.text((x+120,1050),t,font=F(B,32),fill=c,anchor='mm',align='center')
im.save('/home/claude/car1/s5.png')
# 6
im,d=base(6,n,"Kamu lebih sering ngecas semalaman atau di meja kerja?","Itu yang menentukan apakah batas 80 persen cocok untuk kebiasaanmu.","Tulis di komentar.",src=False)
d.ellipse([240,820,440,1020],fill=INK); d.ellipse([290,800,470,980],fill=BG)
d.rectangle([600,900,900,930],fill=INK); d.rectangle([620,930,640,1040],fill=INK); d.rectangle([860,930,880,1040],fill=INK)
d.rounded_rectangle([660,820,840,900],radius=10,outline=INK,width=6)
d.text((340,1090),"semalaman",font=F(B,34),fill=ACC,anchor='mm'); d.text((750,1090),"meja kerja",font=F(B,34),fill=ACC,anchor='mm')
im.save('/home/claude/car1/s6.png')
