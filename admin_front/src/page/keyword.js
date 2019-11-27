import React, {useState, useEffect, useCallback} from 'react';
import Axios from 'axios';


function useForceUpdate() {
    const [, setTick] = useState(0);
    const update = useCallback(() => {
      setTick(tick => tick + 1);
    }, [])
    return update;
}

export const KeywordList = ({look}) => {
    const List = useState([]);
    const onChose = useState({});
    const participants = useState([]);
    const newKey = useState("")
    const newPar = useState("")
    const onLook = useState("")

    function loadList() {
        Axios.get("/admin/keyword", {withCredentials: true})
        .then(ans => {
            List[1](ans.data)
        })
    }
    useEffect(() => {
        loadList()
    }, [])

    useEffect(() => {
        Axios.get(`/admin/keywordOne?phrase=${onChose[0]}`, {withCredentials: true})
        .then(ans => {
            if(ans.data.length > 0) {
                console.log(ans.data[0])
                participants[1](ans.data[0].participants)
            }
        })
    }, [onChose[0]])

    return(<div>
        <div style={{maxHeight: "15vh", overflow: "scroll"}}><table style={{border: "1px solid black", width:"90vw"}}>
            <thead>
                <th>키워드</th><th>참여식당</th>
            </thead>
            <tbody  style={{fontSize:"1.5vh"}}>
                {List[0].map(item => <tr style={{backgroundColor: onChose[0]===item.phrase?"skyblue":"white"}} onClick={() => {onChose[1](item.phrase)}}>
                <td>{item.phrase}</td>
                <td>{JSON.stringify(item.participants)}</td>
                </tr>)}
            </tbody>
        </table></div>
        <div style={{margin: "20px 0px 20px 0px"}}>
            키워드 추가
            <input value={newKey[0]} style={{border: "1px solid green"}} onChange={e => newKey[1](e.target.value)}/>
            <button onClick={() => {
                Axios.post('/admin/keyword/phrase', {phrase: newKey[0]}, {withCredentials: true})
                .then(ans => {
                    alert(JSON.stringify(ans.data))
                    loadList()
                })
            }}>추가</button>
        </div>
        <hr/>
        <div>현재: {JSON.stringify(onChose[0])}
            <button style={{height:"30px", border:"1px solid red"}} onClick={() => {
                Axios.delete(`/admin/keyword?phrase=${onChose[0]}`, {withCredentials: true})
                .then(ans => {
                    alert(JSON.stringify(ans.data))
                    loadList()
                })
            }}>키워드 제거</button></div>
        <div style={{margin: "20px 0px 20px 0px",display: "flex", flexDirection:"row"}}>
            <div style={{ height:"10vh", overflow:"scroll"}}>
            <table style={{width: "40vw"}}><tbody  style={{fontSize:"1.5vh"}}>
            {participants[0].map(item => <tr style={{backgroundColor: onLook[0]._id===item._id?"skyblue":"white"}} onClick={() => {onLook[1](item)}} >
                <td>{item.name}</td><td>{item._id}</td>
            </tr>)} 
            </tbody></table></div>
            <div style={{width:"50vw", height:"20vh", overflow:"scroll"}}>
                 <a href={onLook[0].postURL}>Insta Link</a><br/>
                {onLook[0].content}
            </div>
        </div>
        <div style={{fontSize:"1.5vh"}}>
            키워드 참가 식당
            <input value={newPar[0]} onChange={e => newPar[1](e.target.value)} style={{fontSize: "1.5vh", border: "1px solid blue"}}/>
            <button  style={{fontSize:"1.5vh"}} onClick={() => {
                Axios.post('/admin/keyword/participant', {phrase: onChose[0],participants: newPar[0]}, {withCredentials: true})
                .then(ans => {
                    console.log(ans)
                    alert(JSON.stringify(ans.data))
                    loadList()
                })
            }}>추가</button>
            <button  style={{fontSize:"1.5vh"}} onClick={() => {
                Axios.delete(`/admin/keyword/participant?phrase=${onChose[0]}&participant=${newPar[0]}`, {withCredentials: true})
                .then(ans => {
                    console.log(ans)
                    alert(JSON.stringify(ans.data))
                    loadList()
                })
            }}>제거</button>
        </div>
        <div style={{display: "flex", flexDirection:"row"}}>
            <div style={{height:"15vh", overflow:"scroll", width:"80vw"}}>
                <h2>식당 검색하기</h2>
                {look[0].name} {look[0]._id}<br/>
                {look[0].images?look[0].images.map(item => <img style={{width:"15vw"}} src={item}/>):""}
            </div>
        </div>
        <hr/>
    </div>)
}