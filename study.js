export const normalize=text=>String(text).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96)).trim();
export function cleanProgress(value,cards){
 const valid=new Set(cards.map(c=>String(c.id))),result={};
 if(!value||typeof value!=='object'||Array.isArray(value))return result;
 for(const [id,p]of Object.entries(value)){if(valid.has(id)&&p&&['new','weak','known'].includes(p.status))result[id]={status:p.status,star:!!p.star,seen:Math.max(0,Math.min(100000,Number(p.seen)||0))};}
 return result;
}
export function createPractice(cards,saved={}){
 if(!Array.isArray(cards)||!cards.length)throw new Error('Empty collection');
 const byId=new Map(cards.map(c=>[c.id,c]));let progress=cleanProgress(saved.progress,cards),category='all',scope='all',shuffle=false,direction=['en','ja'].includes(saved.direction)?saved.direction:'en',deck=cards.map(c=>c.id),position=0,revealed=false;
 const mark=id=>progress[id]||{status:'new',star:false,seen:0};
 const counts=()=>({total:cards.length,known:cards.filter(c=>mark(c.id).status==='known').length,weak:cards.filter(c=>mark(c.id).status==='weak').length,star:cards.filter(c=>mark(c.id).star).length,seen:cards.filter(c=>mark(c.id).seen>0).length});
 const matching=()=>cards.filter(c=>(category==='all'||c.category===category)&&(scope==='all'||(scope==='star'?mark(c.id).star:mark(c.id).status===scope)));
 const randomize=list=>{const result=[...list];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;};
 const state=()=>({card:byId.get(deck[position])||null,deck:[...deck],position,revealed,direction,category,scope,shuffle,progress:structuredClone(progress),counts:counts()});
 const rebuild=keep=>{deck=matching().map(c=>c.id);if(shuffle)deck=randomize(deck);position=Math.max(0,deck.indexOf(keep));revealed=false;return state();};
 const choose=id=>{if(!byId.has(id))throw new Error('Invalid card number');if(!deck.includes(id)){category='all';scope='all';rebuild();}position=deck.indexOf(id);revealed=false;return state();};
 if(byId.has(Number(saved.cardId)))choose(Number(saved.cardId));
 return {state,mark,matching,choose,configure(options={}){if(options.category!==undefined&&!['all','equipment','activity','body','health','work'].includes(options.category))throw new Error('Invalid category');if(options.scope!==undefined&&!['all','new','weak','known','star'].includes(options.scope))throw new Error('Invalid collection');if(options.direction!==undefined&&!['en','ja'].includes(options.direction))throw new Error('Invalid direction');const keep=state().card?.id;category=options.category??category;scope=options.scope??scope;shuffle=options.shuffle??shuffle;direction=options.direction??direction;return rebuild(keep);},reveal(){if(!revealed&&state().card){const id=state().card.id;progress[id]={...mark(id),seen:mark(id).seen+1};}revealed=!!state().card;return state();},hide(){revealed=false;return state();},move(delta){if(![-1,1].includes(delta))throw new Error('Invalid move');if(deck.length)position=(position+delta+deck.length)%deck.length;revealed=false;return state();},rate(status){if(!revealed||!state().card||!['weak','known'].includes(status))throw new Error('Reveal the answer before rating');const id=state().card.id;progress[id]={...mark(id),status};if(!matching().some(c=>c.id===id)){deck=deck.filter(x=>x!==id);if(position>=deck.length)position=0;revealed=false;}return state();},toggleStar(){if(!state().card)return state();const id=state().card.id;progress[id]={...mark(id),star:!mark(id).star};return state();},restart(){return rebuild();},serialize(){return {version:2,progress,direction,cardId:state().card?.id||1};}};
}
