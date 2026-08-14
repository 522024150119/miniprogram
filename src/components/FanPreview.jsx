import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  PhoneFrame,
  IndexPage,
  GameDetailPage,
  CharacterDetailPage,
  CabinetPage,
  ProfilePage
} from '../pages/MiniProgram';
import './FanPreview.css';

const SCREENS = [
  { name: '索引', tab: 'index', Comp: IndexPage },
  { name: '作品详情', tab: null, Comp: GameDetailPage },
  { name: '角色详情', tab: null, Comp: CharacterDetailPage },
  { name: '我的游戏', tab: 'cabinet', Comp: CabinetPage },
  { name: '我的', tab: 'profile', Comp: ProfilePage }
];

const X = 160; // 相邻手机的水平间距（排成一排）

export default function FanPreview() {
  const rootRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const cards = cardRefs.current.filter(Boolean);
    if (!cards.length) return undefined;
    const center = (cards.length - 1) / 2;

    gsap.set(cards, {
      xPercent: -50,
      x: 0,
      opacity: 0.3
    });

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
    tl.to(cards, {
      x: (i) => (i - center) * X,
      opacity: 1,
      duration: 0.7,
      stagger: 0.08
    });

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          tl.play(0);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      tl.kill();
    };
  }, []);

  return (
    <div className="fan-preview" ref={rootRef}>
      {SCREENS.map((s, i) => (
        <div className="fan-card" key={s.name} ref={(el) => (cardRefs.current[i] = el)}>
          <div className="fan-phone">
            <PhoneFrame tab={s.tab}>
              <s.Comp />
            </PhoneFrame>
          </div>
        </div>
      ))}
    </div>
  );
}
