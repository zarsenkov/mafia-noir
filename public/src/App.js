import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Heart, Skull, ArrowRight, Eye, RefreshCw, UserPlus, X } from 'lucide-react';

// --- ФУНКЦИЯ РАСПРЕДЕЛЕНИЯ РОЛЕЙ ---
// Перемешивает роли в зависимости от количества игроков
const generateRoles = (playersCount) => {
  let roles = [];
  const mafiaCount = Math.max(1, Math.floor(playersCount / 3)); // 1 мафия на каждых 3 игроков
  
  // Добавляем мафию
  for (let i = 0; i < mafiaCount; i++) {
    roles.push({ name: 'МАФИЯ', icon: <Skull color="#ff0033" size={48} />, desc: 'Ваша цель — устранить всех мирных жителей.' });
  }
  // Добавляем доктора (если больше 3 игроков)
  if (playersCount > 3) {
    roles.push({ name: 'ДОКТОР', icon: <Heart color="#22c55e" size={48} />, desc: 'Вы можете спасти одного человека каждую ночь.' });
  }
  // Добавляем комиссара (если больше 5 игроков)
  if (playersCount > 5) {
    roles.push({ name: 'КОМИССАР', icon: <Shield color="#3b82f6" size={48} />, desc: 'Вы можете проверить роль одного игрока ночью.' });
  }
  // Остальные — мирные
  while (roles.length < playersCount) {
    roles.push({ name: 'МИРНЫЙ', icon: <Users color="#fff" size={48} />, desc: 'Найдите мафию и проголосуйте против неё днём.' });
  }
  return roles.sort(() => Math.random() - 0.5); // Случайное перемешивание
};

export default function App() {
  const [gameState, setGameState] = useState('lobby'); // lobby, distribute, game
  const [names, setNames] = useState([]); // Список имен
  const [currentName, setCurrentName] = useState(''); // Поле ввода
  const [assignedPlayers, setAssignedPlayers] = useState([]); // Игроки с ролями
  const [step, setStep] = useState(0); // Текущий игрок при раздаче
  const [revealed, setRevealed] = useState(false); // Открыта ли карта роли

  // --- ДОБАВЛЕНИЕ ИГРОКА ---
  const handleAddPlayer = () => {
    if (currentName.trim() && names.length < 16) {
      setNames([...names, currentName.trim()]);
      setCurrentName('');
    }
  };

  // --- СТАРТ РАЗДАЧИ ---
  const startDistribution = () => {
    if (names.length < 3) return alert('Нужно минимум 3 игрока');
    const roles = generateRoles(names.length);
    const data = names.map((name, i) => ({ name, role: roles[i] }));
    setAssignedPlayers(data);
    setGameState('distribute');
  };

  // --- ПЕРЕХОД К СЛЕДУЮЩЕМУ ИГРОКУ ---
  const nextStep = () => {
    if (step < assignedPlayers.length - 1) {
      setStep(step + 1);
      setRevealed(false);
    } else {
      setGameState('game');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.vignette} />
      
      <AnimatePresence mode="wait">
        {/* ЭКРАН 1: ВВОД ИМЕН */}
        {gameState === 'lobby' && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.content}>
            <h1 style={styles.title}>MAFIA<span style={{color: '#ff0033'}}>NOIR</span></h1>
            <div style={styles.inputBox}>
              <input 
                style={styles.input} 
                value={currentName} 
                onChange={(e) => setCurrentName(e.target.value)} 
                placeholder="ИМЯ ИГРОКА"
                onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
              />
              <button style={styles.addBtn} onClick={handleAddPlayer}><UserPlus /></button>
            </div>
            <div style={styles.chipContainer}>
              {names.map((n, i) => (
                <div key={i} style={styles.chip}>{n} <X size={14} onClick={() => setNames(names.filter((_, idx) => idx !== i))} /></div>
              ))}
            </div>
            {names.length >= 3 && (
              <button style={styles.startBtn} onClick={startDistribution}>РАСПРЕДЕЛИТЬ РОЛИ</button>
            )}
          </motion.div>
        )}

        {/* ЭКРАН 2: РАЗДАЧА (ПЕРЕДАЧА ТЕЛЕФОНА) */}
        {gameState === 'distribute' && (
          <motion.div key="distribute" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={styles.content}>
            <p style={styles.label}>ПЕРЕДАЙТЕ ТЕЛЕФОН:</p>
            <h2 style={styles.activeName}>{assignedPlayers[step].name}</h2>
            
            <div style={styles.card} onClick={() => setRevealed(true)}>
              {!revealed ? (
                <div style={styles.cardCover}><Eye size={48} /><p>НАЖМИ, ЧТОБЫ УЗНАТЬ РОЛЬ</p></div>
              ) : (
                <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} style={styles.cardInfo}>
                  {assignedPlayers[step].role.icon}
                  <h3 style={styles.roleTitle}>{assignedPlayers[step].role.name}</h3>
                  <p style={styles.roleDesc}>{assignedPlayers[step].role.desc}</p>
                </motion.div>
              )}
            </div>

            {revealed && (
              <button style={styles.startBtn} onClick={nextStep}>ЯСНО, СЛЕДУЮЩИЙ</button>
            )}
          </motion.div>
        )}

        {/* ЭКРАН 3: ИГРА (СПИСОК ДЛЯ ВЕДУЩЕГО) */}
        {gameState === 'game' && (
          <motion.div key="game" style={styles.content}>
            <h2 style={styles.title}>ГОРОД <span style={{color: '#ff0033'}}>ЗАСЫПАЕТ</span></h2>
            <div style={styles.finalList}>
              {assignedPlayers.map((p, i) => (
                <div key={i} style={styles.finalRow}>
                  <span>{p.name}</span>
                  <span style={{color: '#666', fontSize: '12px'}}>{p.role.name}</span>
                </div>
              ))}
            </div>
            <button style={styles.resetBtn} onClick={() => window.location.reload()}><RefreshCw size={16} /> НОВАЯ ИГРА</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- СТИЛИ (NOIR UI) ---
const styles = {
  container: { height: '100dvh', background: '#080808', color: '#fff', fontFamily: 'Unbounded, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  vignette: { position: 'fixed', inset: 0, background: 'radial-gradient(circle, transparent, #000)', pointerEvents: 'none' },
  content: { zIndex: 1, width: '100%', maxWidth: '400px', textAlign: 'center' },
  title: { fontSize: '32px', fontWeight: '900', marginBottom: '30px' },
  inputBox: { display: 'flex', gap: '10px', marginBottom: '20px' },
  input: { flex: 1, background: '#111', border: '1px solid #333', padding: '15px', color: '#fff', borderRadius: '12px', fontFamily: 'Unbounded' },
  addBtn: { background: '#ff0033', border: 'none', color: '#fff', padding: '10px 15px', borderRadius: '12px' },
  chipContainer: { display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '30px' },
  chip: { background: '#1a1a1a', padding: '8px 15px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #333' },
  startBtn: { width: '100%', background: '#ff0033', border: 'none', padding: '20px', color: '#fff', fontWeight: '900', borderRadius: '15px', cursor: 'pointer' },
  label: { fontSize: '10px', color: '#666', letterSpacing: '2px' },
  activeName: { fontSize: '36px', color: '#ff0033', margin: '10px 0 30px 0' },
  card: { background: '#111', height: '350px', borderRadius: '24px', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  cardCover: { opacity: 0.3, textAlign: 'center' },
  cardInfo: { textAlign: 'center', padding: '20px' },
  roleTitle: { fontSize: '28px', margin: '20px 0 10px 0' },
  roleDesc: { fontSize: '14px', color: '#888', lineHeight: '1.5' },
  finalList: { background: '#111', borderRadius: '20px', padding: '10px', marginBottom: '20px' },
  finalRow: { display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #222' },
  resetBtn: { background: 'none', border: 'none', color: '#444', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }
};
