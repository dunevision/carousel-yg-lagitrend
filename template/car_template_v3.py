# TEMPLATE V2 (tema gelap, gaya referensi Klipdong/Oneline). 1080x1080. Logo pemilik: taruh file logo.png (PNG transparan) di folder template/, otomatis dipakai di pojok kanan bawah.
from PIL import Image, ImageDraw, ImageFont
import os
W=1080;H=1350  # V3: rasio 4:5 (1080x1350), sama seperti referensi 1440x1800
AN='/usr/share/fonts/truetype/google-fonts/ofl/anton/Anton-Regular.ttf'
PB='/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'
PM='/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf'
PR='/usr/share/fonts/truetype/google-fonts/Poppins-Regular.ttf'
BG=(10,12,18); WHITE=(244,241,234); ACC=(255,184,64); MUT=(200,205,215); CARD=(24,28,38); LN=(70,76,92); GRN=(60,200,130); INKD=(12,12,16)
SC=3  # supersampling: gambar digambar 3x lebih besar lalu dikecilkan, supaya tepi halus (anti-aliasing)
class SF:
    def __init__(self,raw):self.raw=raw
F=lambda p,s:SF(ImageFont.truetype(p,int(s*SC)))
def _f(v):
    out=[]
    for a in (v if isinstance(v,(list,tuple)) else [v]):
        out.extend(_f(a) if isinstance(a,(list,tuple)) else [a*SC])
    return out
def _pts(v):
    f=_f(v);return [(f[k],f[k+1]) for k in range(0,len(f),2)] if isinstance(v[0],(list,tuple)) else f
class SD:
    def __init__(self,c):self.d=ImageDraw.Draw(c.img)
    def text(self,xy,t,font,fill=None,anchor=None):self.d.text((xy[0]*SC,xy[1]*SC),t,font=font.raw,fill=fill,anchor=anchor)
    def textlength(self,t,font):return self.d.textlength(t,font=font.raw)/SC
    def line(self,xy,fill=None,width=1,joint=None):self.d.line(_pts(xy),fill=fill,width=int(width*SC),joint=joint)
    def rectangle(self,xy,fill=None,outline=None,width=1):self.d.rectangle(_f(xy),fill=fill,outline=outline,width=int(width*SC))
    def rounded_rectangle(self,xy,radius=0,fill=None,outline=None,width=1):self.d.rounded_rectangle(_f(xy),radius=radius*SC,fill=fill,outline=outline,width=int(width*SC))
    def ellipse(self,xy,fill=None,outline=None,width=1):self.d.ellipse(_f(xy),fill=fill,outline=outline,width=int(width*SC))
    def polygon(self,xy,fill=None,outline=None):self.d.polygon(_pts(xy),fill=fill,outline=outline)
    def pieslice(self,xy,start,end,fill=None):self.d.pieslice(_f(xy),start,end,fill=fill)
    def arc(self,xy,start,end,fill=None,width=1):self.d.arc(_f(xy),start,end,fill=fill,width=int(width*SC))
class Canvas:
    def __init__(self,img):self.img=img
    def paste_big(self,g,xy):self.img.paste(g,(int(xy[0]),int(xy[1])),g)
    def save(self,path):self.img.resize((W,H),Image.LANCZOS).save(path)
IDENT=[('ig','@yg_lagitrend'),('fb','yg lagi trend'),('th','@yg_lagitrend')]  # satu set untuk semua platform
ICONDIR='/home/claude/carousel-yg-lagitrend/template/icons/'
LOGO='/home/claude/carousel-yg-lagitrend/template/logo.png'
KEEP=["Face ID","Touch ID","Apple Account","iOS 17.3","Stolen Device Protection","Find My","Significant Locations","Settings"]
def wrap(d,t,f,w):
    for k in KEEP:t=t.replace(k,k.replace(' ','\x00'))
    out=[];l=''
    for wd in t.split(' '):
        c=(l+' '+wd).strip()
        if d.textlength(c.replace('\x00',' '),font=f)<=w:l=c
        else:out.append(l);l=wd
    out.append(l);return [x.replace('\x00',' ') for x in out]
def bwrap(d,t,f,w):
    base=wrap(d,t,f,w);n=len(base)
    if n<2:return base
    best=base
    for ww in range(int(w),int(w*0.55),-10):
        c=wrap(d,t,f,ww)
        if len(c)==n:best=c
        else:break
    if len(best[-1].split())==1 and len(best)>1:
        for ww in range(int(w),int(w*0.4),-10):
            c=wrap(d,t,f,ww)
            if len(c)==n and len(c[-1].split())>1:best=c;break
    return best
def lines(d,x,y,t,f,fill,w,lh):
    for l in bwrap(d,t,f,w):d.text((x,y),l,font=f,fill=fill);y+=lh
    return y
def logo(im,cx,cy,r=95,onacc=False):
    d=SD(im)
    if os.path.exists(LOGO):
        lg=Image.open(LOGO).convert('RGBA');lg.thumbnail((2*r*SC,2*r*SC),Image.LANCZOS);im.paste_big(lg,(cx*SC-lg.width//2,cy*SC-lg.height//2))
    else:
        d.ellipse([cx-r,cy-r,cx+r,cy+r],outline=INKD if onacc else ACC,width=5);d.text((cx,cy),"LOGO",font=F(PB,30),fill=INKD if onacc else ACC,anchor='mm')
def identity(d,im,x,y0,dark=False,pitch=42):
    # y0 = titik tengah baris pertama; ikon dan teks disejajarkan di tengah baris
    col=INKD if dark else WHITE;S=24
    for k,(ic,txt) in enumerate(IDENT):
        cy=y0+k*pitch
        pth=ICONDIR+ic+'.png'
        if os.path.exists(pth):
            g=Image.open(pth).convert('RGBA');g.thumbnail((S*SC,S*SC),Image.LANCZOS);im.paste_big(g,((x+S/2)*SC-g.width//2,cy*SC-g.height//2))
            if ic=='th' and not dark:d.rounded_rectangle([x-1,cy-S//2-1,x+S,cy+S//2],radius=8,outline=(120,126,140),width=2)
        else:
            d.rounded_rectangle([x,cy-S//2,x+S,cy+S//2],radius=7,outline=col,width=2);d.text((x+S//2,cy),{'ig':'IG','fb':'FB','th':'TH'}[ic],font=F(PB,12),fill=col,anchor='mm')
        d.text((x+S+12,cy),txt,font=F(PB,20),fill=col,anchor='lm')
def frame(i,n,src=None,panel=False):
    im=Canvas(Image.new('RGB',(W*SC,H*SC),BG));d=SD(im)
    for x in range(0,W,110):d.line([x,0,x,H],fill=(15,17,24),width=2)
    d.text((80,105),f"{i:02d}",font=F(AN,64),fill=ACC,anchor='ls');d.text((80+d.textlength(f"{i:02d}",font=F(AN,64))+8,105),f"/{n:02d}",font=F(PB,28),fill=MUT,anchor='ls')
    d.rectangle([W-80-(d.textlength("YG LAGITREND",font=F(PB,28))+34),70,W-80-(d.textlength("YG LAGITREND",font=F(PB,28))+34)+18,88],fill=ACC)
    d.text((W-80,105),"YG LAGITREND",font=F(PB,28),fill=WHITE,anchor='rs')
    d.line([80,130,W-80,130],fill=LN,width=3)
    if not panel:
        if src:d.text((80,H-196),src,font=F(PR,28),fill=MUT,anchor='ls')
        identity(d,im,80,H-128,False,32);logo(im,925,H-120,95)
    return im,d
def hook(i,n,title,hl,body):
    im,d=frame(i,n,panel=True);y=170;tf=F(AN,112)
    for l in wrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=122
    y+=26
    hw=d.textlength(hl,font=tf);d.rectangle([72,y+14,72+hw+36,y+150],fill=ACC);d.text((90,y+10),hl,font=tf,fill=INKD)
    d.rectangle([0,650,W,H],fill=ACC);lines(d,80,682,body,F(PB,36),INKD,780,50);identity(d,im,80,940,True,32)
    logo(im,915,870,105,True);return im
def content(i,n,title,intro,items,src,numbered=True):
    im,d=frame(i,n,src);y=175;tf=F(AN,92)
    for l in bwrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=108
    y+=22;y=lines(d,80,y,intro,F(PM,34),MUT,920,48)+16
    ch=min(150,int((840-y)/len(items)))-14
    for k,t in enumerate(items):
        yy=y+k*(ch+14);d.rounded_rectangle([80,yy,1000,yy+ch],radius=22,fill=CARD,outline=LN,width=2)
        d.ellipse([105,yy+ch//2-30,165,yy+ch//2+30],fill=ACC if numbered else GRN);d.text((135,yy+ch//2),str(k+1) if numbered else "v",font=F(AN,38) if numbered else F(PB,34),fill=INKD,anchor='mm')
        f=F(PB,34);ls=bwrap(d,t,f,780);ty=yy+(ch-len(ls)*46)//2
        for l in ls:d.text((195,ty),l,font=f,fill=WHITE);ty+=46
    return im
def stat(i,n,big,cap,body,src):
    im,d=frame(i,n,src);bf=F(AN,330);d.text((80,505),big,font=bf,fill=ACC,anchor='ls')
    d.text((80,585),cap,font=F(PB,40),fill=WHITE,anchor='ls');d.rectangle([80,625,170,633],fill=ACC)
    lines(d,80,660,body,F(PR,34),WHITE,900,46);return im
def closer(i,n,q,sub,src):
    im,d=frame(i,n,src);y=215;tf=F(AN,110)
    for l in bwrap(d,q,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=130
    lines(d,80,y+20,sub,F(PM,36),MUT,620,50);return im

# ---------- ILUSTRASI (tema gelap) ----------
RED=(240,90,80)
def ic_phone(d,cx,cy,s=1,col=WHITE):
    d.rounded_rectangle([cx-42*s,cy-80*s,cx+42*s,cy+80*s],radius=int(14*s),outline=col,width=max(3,int(6*s)),fill=(18,22,30))
    d.rounded_rectangle([cx-14*s,cy-68*s,cx+14*s,cy-62*s],radius=3,fill=col)
def ic_shield(d,cx,cy,s=1,col=ACC,tick=INKD):
    d.polygon([(cx-30*s,cy-34*s),(cx+30*s,cy-34*s),(cx+30*s,cy+4*s),(cx,cy+40*s),(cx-30*s,cy+4*s)],fill=col)
    d.line([(cx-13*s,cy-2*s),(cx-3*s,cy+11*s),(cx+16*s,cy-14*s)],fill=tick,width=max(3,int(6*s)),joint='curve')
def ic_clock(d,cx,cy,s=1,col=ACC):
    d.ellipse([cx-62*s,cy-62*s,cx+62*s,cy+62*s],outline=col,width=max(4,int(9*s)),fill=(18,22,30))
    d.line([cx,cy,cx,cy-38*s],fill=col,width=max(3,int(8*s)));d.line([cx,cy,cx+28*s,cy+16*s],fill=col,width=max(3,int(8*s)))
def ic_x(d,cx,cy,s=1,col=RED):
    d.ellipse([cx-34*s,cy-34*s,cx+34*s,cy+34*s],fill=col)
    d.line([cx-14*s,cy-14*s,cx+14*s,cy+14*s],fill=WHITE,width=max(4,int(8*s)));d.line([cx-14*s,cy+14*s,cx+14*s,cy-14*s],fill=WHITE,width=max(4,int(8*s)))
def ic_ok(d,cx,cy,s=1,col=GRN):
    d.ellipse([cx-34*s,cy-34*s,cx+34*s,cy+34*s],fill=col)
    d.line([(cx-15*s,cy+1*s),(cx-4*s,cy+13*s),(cx+17*s,cy-13*s)],fill=WHITE,width=max(4,int(8*s)),joint='curve')
def flow(i,n,title,intro,steps,note,src):
    """steps: list of (ikon, label); ikon in 'phone','clock','phone2'"""
    im,d=frame(i,n,src);y=175;tf=F(AN,92)
    for l in bwrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=108
    y+=22;y=lines(d,80,y,intro,F(PM,34),MUT,920,48)+24
    k=len(steps);gap=50;cw=(920-gap*(k-1))//k;ch=330
    for j,(ic,lab) in enumerate(steps):
        x=80+j*(cw+gap);d.rounded_rectangle([x,y,x+cw,y+ch],radius=26,fill=CARD,outline=LN,width=2)
        d.ellipse([x+16,y+16,x+62,y+62],fill=ACC);d.text((x+39,y+40),str(j+1),font=F(AN,30),fill=INKD,anchor='mm')
        cx=x+cw//2;cy=y+130
        draw_icon(d,ic,cx,cy,1.0)
        f=F(PB,28);ly=y+235
        for l in bwrap(d,lab,f,cw-30)[:3]:d.text((cx,ly),l,font=f,fill=WHITE,anchor='mm');ly+=36
        if j<k-1:
            ax=x+cw+8;ay=y+ch//2-40;d.polygon([(ax,ay-22),(ax+34,ay),(ax,ay+22)],fill=ACC)
    lines(d,80,y+ch+34,note,F(PM,34),MUT,920,48);return im
def compare(i,n,title,left,right,note,src):
    """left/right: (judul, keterangan)"""
    im,d=frame(i,n,src);y=175;tf=F(AN,92)
    for l in bwrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=108
    y+=40;cw=440;ch=420
    for j,(t,sub) in enumerate((left,right)):
        x=80+j*(cw+40);good=(j==0)
        d.rounded_rectangle([x,y,x+cw,y+ch],radius=26,fill=CARD,outline=GRN if good else RED,width=4)
        cx=x+cw//2;ic_phone(d,cx,y+130,1.15)
        if good:ic_shield(d,cx,y+135,1.15);ic_ok(d,cx+62,y+60,0.8)
        else:ic_x(d,cx,y+135,1.0)
        f=F(PB,32);ly=y+250
        for l in bwrap(d,t,f,cw-40):d.text((cx,ly),l,font=f,fill=WHITE,anchor='mm');ly+=42
        f2=F(PR,28);ly+=14
        for l in bwrap(d,sub,f2,cw-50):d.text((cx,ly),l,font=f2,fill=MUT,anchor='mm');ly+=38
    lines(d,80,y+ch+30,note,F(PM,34),MUT,920,48);return im

# ---------- IKON TAMBAHAN (digambar dengan kode) ----------
BROWN=(150,96,56);CREAM=(238,214,160);TEAL=(70,190,200)
def ic_sprout(d,cx,cy,s=1,col=GRN):
    d.line([cx,cy+55*s,cx,cy-5*s],fill=col,width=max(4,int(9*s)))
    d.ellipse([cx-60*s,cy-40*s,cx-4*s,cy-2*s],fill=col);d.ellipse([cx+4*s,cy-62*s,cx+60*s,cy-24*s],fill=col)
def ic_arrows(d,cx,cy,s=1,col=ACC):
    for k in (-1,0,1):
        y=cy+k*30*s;d.line([cx-55*s,y,cx+30*s,y],fill=col,width=max(4,int(9*s)));d.polygon([(cx+22*s,y-18*s),(cx+58*s,y),(cx+22*s,y+18*s)],fill=col)
def ic_drop(d,cx,cy,s=1,col=TEAL):
    d.polygon([(cx,cy-62*s),(cx-34*s,cy+8*s),(cx+34*s,cy+8*s)],fill=col);d.ellipse([cx-40*s,cy-12*s,cx+40*s,cy+60*s],fill=col)
def ic_bottle(d,cx,cy,s=1,col=ACC):
    d.rounded_rectangle([cx-30*s,cy-30*s,cx+30*s,cy+62*s],radius=int(10*s),fill=col)
    d.rectangle([cx-14*s,cy-52*s,cx+14*s,cy-30*s],fill=col);d.rectangle([cx-20*s,cy-66*s,cx+20*s,cy-52*s],fill=WHITE)
    d.rectangle([cx-20*s,cy-2*s,cx+20*s,cy+26*s],fill=INKD)
def ic_choco(d,cx,cy,s=1,col=BROWN):
    d.rounded_rectangle([cx-50*s,cy-62*s,cx+50*s,cy+62*s],radius=int(10*s),fill=col)
    for k in (-1,1):d.line([cx+k*0,cy-62*s,cx,cy+62*s],fill=(90,56,30),width=max(2,int(4*s))) if False else None
    d.line([cx,cy-62*s,cx,cy+62*s],fill=(90,56,30),width=max(2,int(4*s)))
    for y in (-21,21):d.line([cx-50*s,cy+y*s,cx+50*s,cy+y*s],fill=(90,56,30),width=max(2,int(4*s)))
def ic_onion(d,cx,cy,s=1,col=CREAM):
    d.polygon([(cx,cy-66*s),(cx-18*s,cy-30*s),(cx+18*s,cy-30*s)],fill=col);d.ellipse([cx-52*s,cy-40*s,cx+52*s,cy+56*s],fill=col)
    d.arc([cx-30*s,cy-36*s,cx+30*s,cy+52*s],100,260,fill=(190,150,90),width=max(2,int(4*s)));d.arc([cx-30*s,cy-36*s,cx+30*s,cy+52*s],-80,80,fill=(190,150,90),width=max(2,int(4*s)))
    d.line([cx-10*s,cy+56*s,cx-14*s,cy+70*s],fill=(190,150,90),width=max(2,int(4*s)));d.line([cx+10*s,cy+56*s,cx+14*s,cy+70*s],fill=(190,150,90),width=max(2,int(4*s)))
def ic_warn(d,cx,cy,s=1,col=ACC):
    d.polygon([(cx,cy-60*s),(cx-62*s,cy+48*s),(cx+62*s,cy+48*s)],fill=col)
    d.rectangle([cx-6*s,cy-22*s,cx+6*s,cy+18*s],fill=INKD);d.ellipse([cx-7*s,cy+26*s,cx+7*s,cy+40*s],fill=INKD)
def ic_note(d,cx,cy,s=1,col=WHITE):
    d.rounded_rectangle([cx-42*s,cy-56*s,cx+42*s,cy+56*s],radius=int(10*s),fill=col)
    for y in (-28,-6,16,38):d.line([cx-26*s,cy+y*s,cx+26*s,cy+y*s],fill=INKD,width=max(2,int(5*s)))
def ic_call(d,cx,cy,s=1,col=GRN):
    ic_phone(d,cx-14*s,cy,0.9*s,WHITE)
    for k,r in enumerate((26,40,54)):d.arc([cx+10*s,cy-r*s-8*s,cx+10*s+r*s*2,cy+r*s-8*s],-50,50,fill=col,width=max(3,int(6*s)))
def ic_heart(d,cx,cy,s=1,col=RED):
    d.ellipse([cx-52*s,cy-46*s,cx,cy+6*s],fill=col);d.ellipse([cx,cy-46*s,cx+52*s,cy+6*s],fill=col)
    d.polygon([(cx-50*s,cy-12*s),(cx+50*s,cy-12*s),(cx,cy+54*s)],fill=col)
def ic_id(d,cx,cy,s=1,col=WHITE):
    d.rounded_rectangle([cx-62*s,cy-42*s,cx+62*s,cy+42*s],radius=int(10*s),fill=col)
    d.ellipse([cx-46*s,cy-24*s,cx-12*s,cy+10*s],fill=INKD);d.rounded_rectangle([cx-52*s,cy+14*s,cx-6*s,cy+30*s],radius=int(8*s),fill=INKD)
    for y in (-18,0,18):d.line([cx+4*s,cy+y*s,cx+48*s,cy+y*s],fill=INKD,width=max(2,int(5*s)))
def ic_pencil(d,cx,cy,s=1,col=ACC):
    d.polygon([(cx-52*s,cy+52*s),(cx-46*s,cy+20*s),(cx+30*s,cy-56*s),(cx+56*s,cy-30*s),(cx-20*s,cy+46*s)],fill=col)
    d.polygon([(cx-52*s,cy+52*s),(cx-46*s,cy+20*s),(cx-20*s,cy+46*s)],fill=WHITE)
def ic_pill(d,cx,cy,s=1,col=ACC):
    d.rounded_rectangle([cx-58*s,cy-26*s,cx+58*s,cy+26*s],radius=int(26*s),fill=WHITE);d.rounded_rectangle([cx-58*s,cy-26*s,cx+2*s,cy+26*s],radius=int(26*s),fill=col);d.rectangle([cx-20*s,cy-26*s,cx+2*s,cy+26*s],fill=col)
def ic_cross(d,cx,cy,s=1,col=GRN):
    d.rounded_rectangle([cx-18*s,cy-56*s,cx+18*s,cy+56*s],radius=int(8*s),fill=col);d.rounded_rectangle([cx-56*s,cy-18*s,cx+56*s,cy+18*s],radius=int(8*s),fill=col)
def ic_moon(d,cx,cy,s=1,col=ACC,bg=(18,22,30)):
    d.ellipse([cx-50*s,cy-50*s,cx+50*s,cy+50*s],fill=col);d.ellipse([cx-22*s,cy-62*s,cx+68*s,cy+28*s],fill=bg)
def ic_bowl(d,cx,cy,s=1,col=ACC):
    d.pieslice([cx-60*s,cy-50*s,cx+60*s,cy+50*s],0,180,fill=col);d.rounded_rectangle([cx-26*s,cy+44*s,cx+26*s,cy+58*s],radius=int(6*s),fill=col)
def ic_window(d,cx,cy,s=1,col=TEAL):
    d.rounded_rectangle([cx-52*s,cy-56*s,cx+52*s,cy+56*s],radius=int(8*s),outline=col,width=max(4,int(8*s)))
    d.line([cx,cy-56*s,cx,cy+56*s],fill=col,width=max(3,int(6*s)));d.line([cx-52*s,cy,cx+52*s,cy],fill=col,width=max(3,int(6*s)))
def ic_house(d,cx,cy,s=1,col=GRN):
    d.polygon([(cx-62*s,cy-4*s),(cx,cy-58*s),(cx+62*s,cy-4*s)],fill=col);d.rectangle([cx-44*s,cy-4*s,cx+44*s,cy+50*s],fill=col);d.rectangle([cx-11*s,cy+16*s,cx+11*s,cy+50*s],fill=INKD)
def ic_cat(d,cx,cy,s=1,col=ACC):
    d.polygon([(cx-52*s,cy-60*s),(cx-18*s,cy-34*s),(cx-56*s,cy-8*s)],fill=col);d.polygon([(cx+52*s,cy-60*s),(cx+18*s,cy-34*s),(cx+56*s,cy-8*s)],fill=col)
    d.ellipse([cx-58*s,cy-44*s,cx+58*s,cy+54*s],fill=col)
    d.ellipse([cx-30*s,cy-12*s,cx-14*s,cy+8*s],fill=INKD);d.ellipse([cx+14*s,cy-12*s,cx+30*s,cy+8*s],fill=INKD)
    d.polygon([(cx-8*s,cy+14*s),(cx+8*s,cy+14*s),(cx,cy+26*s)],fill=INKD)
def ic_ruler(d,cx,cy,s=1,col=ACC):
    d.rounded_rectangle([cx-66*s,cy-24*s,cx+66*s,cy+24*s],radius=int(6*s),fill=col)
    for k in range(-5,6):d.line([cx+k*12*s,cy-24*s,cx+k*12*s,cy-(4 if k%2 else 10)*s-0],fill=INKD,width=max(2,int(4*s))) if False else d.line([cx+k*12*s,cy-24*s,cx+k*12*s,cy+(2 if k%2 else 12)*s],fill=INKD,width=max(2,int(4*s)))
def ic_lock(d,cx,cy,s=1,col=WHITE):
    d.arc([cx-30*s,cy-70*s,cx+30*s,cy-2*s],180,360,fill=col,width=max(4,int(10*s)));d.rounded_rectangle([cx-46*s,cy-26*s,cx+46*s,cy+46*s],radius=int(10*s),fill=col);d.ellipse([cx-9*s,cy-2*s,cx+9*s,cy+16*s],fill=INKD)
def ic_calendar(d,cx,cy,s=1,col=WHITE,txt=''):
    d.rounded_rectangle([cx-52*s,cy-50*s,cx+52*s,cy+54*s],radius=int(10*s),fill=col);d.rectangle([cx-52*s,cy-50*s,cx+52*s,cy-22*s],fill=ACC)
    if txt:d.text((cx,cy+14*s),txt,font=F(AN,int(46*s)),fill=INKD,anchor='mm')
def ic_scissors_hair(d,cx,cy,s=1,col=WHITE):
    ic_arrows(d,cx,cy,s,col)
ICONS=dict(sprout=ic_sprout,arrows=ic_arrows,drop=ic_drop,bottle=ic_bottle,choco=ic_choco,onion=ic_onion,warn=ic_warn,note=ic_note,call=ic_call,heart=ic_heart,id=ic_id,pencil=ic_pencil,pill=ic_pill,cross=ic_cross,moon=ic_moon,bowl=ic_bowl,window=ic_window,house=ic_house,cat=ic_cat,ruler=ic_ruler,lock=ic_lock,clock=ic_clock,phone=lambda d,cx,cy,s=1:(ic_phone(d,cx,cy,s),ic_shield(d,cx,cy+4*s,s)),check=ic_ok,x=ic_x,shield=ic_shield,calendar=ic_calendar)
def draw_icon(d,name,cx,cy,s=1.0):
    ICONS[name](d,cx,cy,s)
def badge(d,cx,cy,name,r=46,s=0.62):
    d.ellipse([cx-r,cy-r,cx+r,cy+r],fill=(34,40,54));draw_icon(d,name,cx,cy,s)
def title_block(d,title,y=175,size=92):
    tf=F(AN,size)
    for l in bwrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=int(size*1.17)
    return y+14
def feature(i,n,title,body,icon,src,sub=None):
    im,d=frame(i,n,src);y=title_block(d,title)
    cy=y+150;d.ellipse([540-135,cy-135,540+135,cy+135],fill=CARD,outline=LN,width=3);draw_icon(d,icon,540,cy,1.75)
    yy=cy+135+30
    if sub:d.text((540,yy+12),sub,font=F(PB,30),fill=ACC,anchor='mm');yy+=44
    lines(d,80,yy,body,F(PM,34),WHITE,920,47);return im
def iconlist(i,n,title,intro,rows,src,note=None):
    im,d=frame(i,n,src);y=title_block(d,title)
    if intro:y=lines(d,80,y+4,intro,F(PM,34),MUT,920,48)+14
    k=len(rows);limit=840-(60 if note else 0);ch=min(138,int((limit-y)/k)-14)
    for j,(ic,t) in enumerate(rows):
        yy=y+j*(ch+14);d.rounded_rectangle([80,yy,1000,yy+ch],radius=22,fill=CARD,outline=LN,width=2)
        badge(d,80+22+46,yy+ch//2,ic);f=F(PB,32);ls=bwrap(d,t,f,760-30);ty=yy+(ch-len(ls)*42)//2+18
        for l in ls:d.text((80+22+92+22,ty),l,font=f,fill=WHITE,anchor='ls');ty+=42
    if note:lines(d,80,y+k*(ch+14)+6,note,F(PM,32),MUT,920,44)
    return im
def twocards(i,n,title,intro,cards,note,src):
    im,d=frame(i,n,src);y=title_block(d,title)
    if intro:y=lines(d,80,y+4,intro,F(PM,34),MUT,920,48)+14
    cw=440;ch=400
    for j,(ic,t,sub) in enumerate(cards):
        x=80+j*(cw+40);d.rounded_rectangle([x,y,x+cw,y+ch],radius=26,fill=CARD,outline=ACC,width=3)
        draw_icon(d,ic,x+cw//2,y+95,1.05)
        f=F(PB,30);ly=y+200
        for l in bwrap(d,t,f,cw-40):d.text((x+cw//2,ly),l,font=f,fill=WHITE,anchor='mm');ly+=38
        ly+=10;f2=F(PR,28)
        for l in bwrap(d,sub,f2,cw-50):d.text((x+cw//2,ly),l,font=f2,fill=MUT,anchor='mm');ly+=36
    if note:lines(d,80,y+ch+28,note,F(PM,32),MUT,920,44)
    return im
def statcards(i,n,title,intro,items,note,src):
    im,d=frame(i,n,src);y=title_block(d,title)
    if intro:y=lines(d,80,y+4,intro,F(PM,34),MUT,920,48)+14
    k=len(items);gap=24;cw=(920-gap*(k-1))//k;ch=380
    for j,(big,unit,lab) in enumerate(items):
        x=80+j*(cw+gap);d.rounded_rectangle([x,y,x+cw,y+ch],radius=26,fill=CARD,outline=LN,width=2)
        d.text((x+cw//2,y+95),big,font=F(AN,96),fill=ACC,anchor='mm');d.text((x+cw//2,y+168),unit,font=F(PB,28),fill=WHITE,anchor='mm')
        ly=y+225
        for l in bwrap(d,lab,F(PR,28),cw-36):d.text((x+cw//2,ly),l,font=F(PR,28),fill=MUT,anchor='mm');ly+=36
    if note:lines(d,80,y+ch+28,note,F(PM,32),MUT,920,44)
    return im
def chips(i,n,title,intro,items,note,src,icon='bottle'):
    im,d=frame(i,n,src);y=title_block(d,title)
    if intro:y=lines(d,80,y+4,intro,F(PM,34),MUT,920,48)+18
    cw=450;ch=110
    for j,t in enumerate(items):
        x=80+(j%2)*(cw+20);yy=y+(j//2)*(ch+16);d.rounded_rectangle([x,yy,x+cw,yy+ch],radius=22,fill=CARD,outline=LN,width=2)
        badge(d,x+22+40,yy+ch//2,icon,r=40,s=0.55);d.text((x+22+80+18,yy+ch//2),t,font=F(PB,30),fill=WHITE,anchor='lm')
    rows=(len(items)+1)//2
    if note:lines(d,80,y+rows*(ch+16)+14,note,F(PM,32),MUT,920,44)
    return im

# ---------- PERBAIKAN LAYOUT (override definisi sebelumnya) ----------
BSCALE=dict(call=0.45,onion=0.55,choco=0.5,warn=0.6,pill=0.6,calendar=0.6,cat=0.6,ruler=0.6,sprout=0.6,arrows=0.6)
def badge(d,cx,cy,name,r=46,s=0.62):
    d.ellipse([cx-r,cy-r,cx+r,cy+r],fill=(34,40,54));draw_icon(d,name,cx,cy,BSCALE.get(name,s)*(r/46))
def title_block(d,title,y=175,size=92):
    tf=F(AN,size)
    for l in bwrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=int(size*1.17)
    return y+34
def hook(i,n,title,hl,body):
    im,d=frame(i,n,panel=True);y=170;size=112;tf=F(AN,size)
    if len(bwrap(d,title,tf,920))>2:size=92;tf=F(AN,size)
    step=int(size*1.09)
    for l in bwrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=step
    y+=int(size*0.2);hw=d.textlength(hl,font=tf)
    d.rectangle([72,y+int(size*0.12),72+hw+36,y+int(size*1.33)],fill=ACC);d.text((90,y+int(size*0.08)),hl,font=tf,fill=INKD)
    d.rectangle([0,650,W,H],fill=ACC);lines(d,80,682,body,F(PB,36),INKD,780,50);identity(d,im,80,908,True,36)
    logo(im,915,870,105,True);return im
def stat(i,n,big,cap,body,src):
    im,d=frame(i,n,src);size=260
    while d.textlength(big,font=F(AN,size))>900:size-=10
    d.text((80,300+size*0.75),big,font=F(AN,size),fill=ACC,anchor='ls');by=300+size*0.75
    d.text((80,by+78),cap,font=F(PB,38),fill=WHITE,anchor='ls');d.rectangle([80,by+110,170,by+118],fill=ACC)
    lines(d,80,by+148,body,F(PR,33),WHITE,920,45);return im
def feature(i,n,title,body,icon,src,sub=None):
    im,d=frame(i,n,src);y=title_block(d,title);ls=bwrap(d,body,F(PM,34),920)
    for rad in (150,135,120,105,90,75):
        cy=y+rad+8;yy=cy+rad+26
        if yy+len(ls)*47<=848:break
    d.ellipse([540-rad,cy-rad,540+rad,cy+rad],fill=CARD,outline=LN,width=3);draw_icon(d,icon,540,cy,1.75*rad/135)
    for l in ls:d.text((80,yy),l,font=F(PM,34),fill=WHITE);yy+=47
    return im
def iconlist(i,n,title,intro,rows,src,note=None):
    im,d=frame(i,n,src);y=title_block(d,title)
    if intro:y=lines(d,80,y-14,intro,F(PM,34),MUT,920,48)+10
    k=len(rows);limit=832-(60 if note else 0);ch=min(138,int((limit-y)/k)-14)
    for j,(ic,t) in enumerate(rows):
        yy=y+j*(ch+14);d.rounded_rectangle([80,yy,1000,yy+ch],radius=22,fill=CARD,outline=LN,width=2)
        badge(d,80+22+46,yy+ch//2,ic);f=F(PB,32);ls=bwrap(d,t,f,760-30);ty=yy+ch/2-(len(ls)-1)*21
        for l in ls:d.text((80+22+92+22,ty),l,font=f,fill=WHITE,anchor='lm');ty+=42
    if note:lines(d,80,y+k*(ch+14)+6,note,F(PM,32),MUT,920,44)
    return im
def flow(i,n,title,intro,steps,note,src):
    im,d=frame(i,n,src);y=title_block(d,title)
    if intro:y=lines(d,80,y-14,intro,F(PM,34),MUT,920,48)+12
    k=len(steps);gap=50;cw=(920-gap*(k-1))//k;f=F(PB,28)
    L=max(len(bwrap(d,lab,f,cw-30)) for _,lab in steps);ch=190+L*36+22
    for j,(ic,lab) in enumerate(steps):
        x=80+j*(cw+gap);d.rounded_rectangle([x,y,x+cw,y+ch],radius=26,fill=CARD,outline=LN,width=2)
        d.ellipse([x+16,y+16,x+62,y+62],fill=ACC);d.text((x+39,y+40),str(j+1),font=F(AN,30),fill=INKD,anchor='mm')
        cx=x+cw//2;draw_icon(d,ic,cx,y+100,0.95);ly=y+190
        for l in bwrap(d,lab,f,cw-30):d.text((cx,ly),l,font=f,fill=WHITE,anchor='mm');ly+=36
        if j<k-1:ax=x+cw+8;ay=y+ch//2-30;d.polygon([(ax,ay-22),(ax+34,ay),(ax,ay+22)],fill=ACC)
    if note:lines(d,80,y+ch+30,note,F(PM,32),MUT,920,44)
    return im
def twocards(i,n,title,intro,cards,note,src,ch=400):
    im,d=frame(i,n,src);y=title_block(d,title)
    if intro:y=lines(d,80,y-14,intro,F(PM,34),MUT,920,48)+12
    cw=440
    for j,(ic,t,sub) in enumerate(cards):
        x=80+j*(cw+40);d.rounded_rectangle([x,y,x+cw,y+ch],radius=26,fill=CARD,outline=ACC,width=3)
        draw_icon(d,ic,x+cw//2,y+90,1.0);f=F(PB,30);ly=y+190
        for l in bwrap(d,t,f,cw-40):d.text((x+cw//2,ly),l,font=f,fill=WHITE,anchor='mm');ly+=38
        ly+=10;f2=F(PR,28)
        for l in bwrap(d,sub,f2,cw-50):d.text((x+cw//2,ly),l,font=f2,fill=MUT,anchor='mm');ly+=36
    if note:lines(d,80,y+ch+26,note,F(PM,32),MUT,920,44)
    return im
def statcards(i,n,title,intro,items,note,src):
    im,d=frame(i,n,src);y=title_block(d,title)
    if intro:y=lines(d,80,y-14,intro,F(PM,34),MUT,920,48)+12
    k=len(items);gap=24;cw=(920-gap*(k-1))//k;ch=400
    for j,(big,unit,lab) in enumerate(items):
        x=80+j*(cw+gap);d.rounded_rectangle([x,y,x+cw,y+ch],radius=26,fill=CARD,outline=LN,width=2)
        d.text((x+cw//2,y+90),big,font=F(AN,96),fill=ACC,anchor='mm');d.text((x+cw//2,y+165),unit,font=F(PB,28),fill=WHITE,anchor='mm')
        ly=y+225
        for l in bwrap(d,lab,F(PR,28),cw-36):d.text((x+cw//2,ly),l,font=F(PR,28),fill=MUT,anchor='mm');ly+=36
    if note:lines(d,80,y+ch+26,note,F(PM,32),MUT,920,44)
    return im
def chips(i,n,title,intro,items,note,src,icon='bottle'):
    im,d=frame(i,n,src);y=title_block(d,title)
    if intro:y=lines(d,80,y-14,intro,F(PM,34),MUT,920,48)+14
    cw=450;ch=92
    for j,t in enumerate(items):
        x=80+(j%2)*(cw+20);yy=y+(j//2)*(ch+14);d.rounded_rectangle([x,yy,x+cw,yy+ch],radius=22,fill=CARD,outline=LN,width=2)
        badge(d,x+22+36,yy+ch//2,icon,r=36,s=0.55);d.text((x+22+72+16,yy+ch//2),t,font=F(PB,30),fill=WHITE,anchor='lm')
    rows=(len(items)+1)//2
    if note:lines(d,80,y+rows*(ch+14)+10,note,F(PM,32),MUT,920,44)
    return im


# ================= V3: LAYOUT 4:5 (1080x1350). Teks dan ilustrasi diperbesar mengikuti tinggi baru, bukan sekadar menambah ruang kosong =================
LIM=H-240   # batas bawah area isi (di atas footer sumber)
def title_block(d,title,y=180,size=104):
    tf=F(AN,size)
    for l in bwrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=int(size*1.15)
    return y+30
def hook(i,n,title,hl,body):
    im,d=frame(i,n,panel=True);y=185;size=124;tf=F(AN,size)
    if len(bwrap(d,title,tf,920))>3:size=104;tf=F(AN,size)
    step=int(size*1.1)
    for l in bwrap(d,title,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=step
    y+=int(size*0.2);hw=d.textlength(hl,font=tf)
    d.rectangle([72,y+int(size*0.12),72+hw+36,y+int(size*1.33)],fill=ACC);d.text((90,y+int(size*0.08)),hl,font=tf,fill=INKD)
    py=840;d.rectangle([0,py,W,H],fill=ACC);lines(d,80,py+36,body,F(PB,40),INKD,800,56);identity(d,im,80,H-138,True,36)
    logo(im,915,H-190,105,True);return im
def twocards(i,n,title,intro,cards,note,src,ch=None):
    im,d=frame(i,n,src);y=title_block(d,title)
    if intro:y=lines(d,80,y-10,intro,F(PM,38),MUT,920,54)+16
    cw=440
    if ch is None:ch=min(600,LIM-y-(70 if note else 0))
    for j,(ic,t,sub) in enumerate(cards):
        x=80+j*(cw+40);d.rounded_rectangle([x,y,x+cw,y+ch],radius=28,fill=CARD,outline=ACC,width=3)
        draw_icon(d,ic,x+cw//2,y+120,1.3);f=F(PB,36);ly=y+250
        for l in bwrap(d,t,f,cw-36):d.text((x+cw//2,ly),l,font=f,fill=WHITE,anchor='mm');ly+=46
        ly+=14;f2=F(PR,31)
        for l in bwrap(d,sub,f2,cw-46):d.text((x+cw//2,ly),l,font=f2,fill=MUT,anchor='mm');ly+=42
    if note:lines(d,80,y+ch+28,note,F(PM,36),MUT,920,50)
    return im
def flow(i,n,title,intro,steps,note,src):
    im,d=frame(i,n,src);y=title_block(d,title)
    if intro:y=lines(d,80,y-10,intro,F(PM,38),MUT,920,54)+18
    k=len(steps);gap=50;cw=(920-gap*(k-1))//k;f=F(PB,31)
    L=max(len(bwrap(d,lab,f,cw-26)) for _,lab in steps);ch=max(250+L*42+30,min(520,LIM-y-(90 if note else 20)))
    for j,(ic,lab) in enumerate(steps):
        x=80+j*(cw+gap);d.rounded_rectangle([x,y,x+cw,y+ch],radius=28,fill=CARD,outline=LN,width=2)
        d.ellipse([x+16,y+16,x+68,y+68],fill=ACC);d.text((x+42,y+44),str(j+1),font=F(AN,34),fill=INKD,anchor='mm')
        cx=x+cw//2;draw_icon(d,ic,cx,y+160,1.35);ly=y+300
        for l in bwrap(d,lab,f,cw-26):d.text((cx,ly),l,font=f,fill=WHITE,anchor='mm');ly+=42
        if j<k-1:ax=x+cw+8;ay=y+ch//2-30;d.polygon([(ax,ay-24),(ax+34,ay),(ax,ay+24)],fill=ACC)
    if note:lines(d,80,y+ch+34,note,F(PM,36),MUT,920,50)
    return im
def feature(i,n,title,body,icon,src,sub=None):
    im,d=frame(i,n,src);y=title_block(d,title);ls=bwrap(d,body,F(PM,38),920)
    for rad in (230,210,190,170,150,130,110,90):
        cy=y+rad+10;yy=cy+rad+34
        if yy+len(ls)*54<=LIM-6:break
    d.ellipse([540-rad,cy-rad,540+rad,cy+rad],fill=CARD,outline=LN,width=3);draw_icon(d,icon,540,cy,1.75*rad/135)
    for l in ls:d.text((80,yy),l,font=F(PM,38),fill=WHITE);yy+=54
    return im
def iconlist(i,n,title,intro,rows,src,note=None):
    im,d=frame(i,n,src);y=title_block(d,title)
    if intro:y=lines(d,80,y-10,intro,F(PM,38),MUT,920,54)+14
    k=len(rows);limit=LIM+20-(70 if note else 0);ch=min(190,int((limit-y)/k)-16)
    for j,(ic,t) in enumerate(rows):
        yy=y+j*(ch+16);d.rounded_rectangle([80,yy,1000,yy+ch],radius=26,fill=CARD,outline=LN,width=2)
        badge(d,80+26+58,yy+ch//2,ic,r=58,s=0.62);f=F(PB,37);ls=bwrap(d,t,f,720-30);ty=yy+ch/2-(len(ls)-1)*24
        for l in ls:d.text((80+26+116+26,ty),l,font=f,fill=WHITE,anchor='lm');ty+=48
    if note:lines(d,80,y+k*(ch+16)+8,note,F(PM,36),MUT,920,50)
    return im
def closer(i,n,q,sub,src):
    im,d=frame(i,n,src);y=270;tf=F(AN,128)
    for l in bwrap(d,q,tf,920):d.text((80,y),l,font=tf,fill=WHITE);y+=150
    lines(d,80,y+24,sub,F(PM,40),MUT,700,56);return im
