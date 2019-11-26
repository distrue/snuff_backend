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
        <table style={{border: "1px solid black"}}>
            <thead>
                <th>키워드</th><th>참여식당</th>
            </thead>
            <tbody>
                {List[0].map(item => <tr onClick={() => {onChose[1](item.phrase)}}>
                <td>{item.phrase}</td>
                <td>{JSON.stringify(item.participants)}</td>
                </tr>)}
            </tbody>
        </table>
        <div style={{margin: "20px 0px 20px 0px"}}>
            키워드 추가
            <input value={newKey[0]} onChange={e => newKey[1](e.target.value)}/>
            <button onClick={() => {
                Axios.post('/admin/keyword/phrase', {phrase: newKey[0]}, {withCredentials: true})
                .then(ans => {
                    alert(JSON.stringify(ans.data))
                    loadList()
                })
            }}>추가</button>
        </div>
        <hr/>
        <div style={{display: "flex", flexDirection:"column"}}>
            현재: {JSON.stringify(onChose[0])}
            {participants[0].map(item => <div>
                {item.name} / {item._id}
            </div>)} 
        </div>
        <div style={{margin: "20px 0px 20px 0px"}}>
            키워드 참가 식당
            <input value={newPar[0]} onChange={e => newPar[1](e.target.value)}/>
            <button onClick={() => {
                Axios.post('/admin/keyword/participant', {phrase: onChose[0],participants: newPar[0]}, {withCredentials: true})
                .then(ans => {
                    console.log(ans)
                    alert(JSON.stringify(ans.data))
                    loadList()
                })
            }}>추가</button>
            <button onClick={() => {
                Axios.delete(`/admin/keyword/participant?phrase=${onChose[0]}&participant=${newPar[0]}`, {withCredentials: true})
                .then(ans => {
                    console.log(ans)
                    alert(JSON.stringify(ans.data))
                    loadList()
                })
            }}>제거</button>
        </div>
        <div>
            <h2>검색 식당</h2>
            {look[0].name} {look[0]._id}
        </div>
    </div>)
}