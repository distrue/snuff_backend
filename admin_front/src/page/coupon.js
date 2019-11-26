import React, {useState, useEffect, useCallback} from 'react';
import Axios from 'axios';
import styled from 'styled-components';

function useForceUpdate() {
    const [, setTick] = useState(0);
    const update = useCallback(() => {
      setTick(tick => tick + 1);
    }, [])
    return update;
}

export const QRList = () => {
    const list = useState('')

    useEffect(() => {
        Axios.get('/admin/QR', {withCredentials: true})
        .then(ans => {
            list[1](ans.data.ans)
        })
    }, [])

    return(<div style={{width:"90vw", height:"10vh"}}>
        <h2>QR코드</h2>
        {JSON.stringify(list[0])}
    </div>)
}

export const OTCodeList = () => {
    const list = useState('')
    const forceUpdate = useForceUpdate();
    const addOTcode = useState({
        code: "",
        coupon: ""
    })

    function addcode() {
        Axios.post('/admin/addOTCode', {code: addOTcode[0].code, coupon: addOTcode[0].coupon})
        .then(ans => {
            console.log(ans)
        })
    }

    function loadList() {
        Axios.get('/admin/OTcode', {withCredentials: true})
        .then(ans => {
            list[1](ans.data.ans);
        })
    }

    useEffect(() => {
        loadList()
    }, [])

    return(<div style={{width:"90vw", height:"10vh", display: "flex", flexDirection: "row"}}>
        <h2 style={{marginRight: "30px"}}>수동코드</h2>
        <div style={{height: "10vh", width:"50vw", border: "1px solid black"}}>
            {JSON.stringify(list[0])}
        </div>
        <table>
            <tbody>
                {[...Object.keys(addOTcode[0])].map(item => {
                return(<tr key={item}>
                    <td>{item}:</td>
                    <td><input value={addOTcode[0][item]} onChange={e => {
                            let ne = {}; ne[item] = e.target.value; 
                            let ans = Object.assign(addOTcode[0], ne);
                            console.log(ans);
                            addOTcode[1](ans);
                            forceUpdate();
                        }}
                    style={{border:"1px solid black", width:"20vw"}}/></td>
                </tr>);
                })}
                <tr>
                    <td><button style={{border: "1px solid black"}} onClick={loadList}>리스트 새로고침</button></td>
                    <td>
                        <button style={{border: "1px solid black"}} onClick={addcode}>수정/등록</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>)
}

export const CouponList = () => {
    const list = useState([])
    const forceUpdate = useForceUpdate();
    const addCoupon = useState({
        blockId: "",
        imageUrl: "",
        title: ""
    })

    function loadList() {
        Axios.get('/admin/coupon', {withCredentials: true})
        .then(ans => {
            list[1](ans.data.ans);
        })
    }

    function addCou() {
        Axios.post('/admin/addCoupon', {blockId: addCoupon[0].blockId, imageUrl: addCoupon[0].imageUrl, title: addCoupon[0].title})
        .then(ans => {
            console.log(ans)
        })
    }

    useEffect(() => {
        loadList()
    }, [])

    return(<div>
        <h2>쿠폰(쿠폰 blueprint, owncoupon 아님)</h2>
        <div style={{width:"80vw", height:"10vh", display: "flex", overflow: "scroll", flexDirection: "row"}}>
            {list[0].map(item => <div style={{border: "1px solid black", width: "20vw", height: "8vh", position: "relative"}}>
                blockId: {item.blockId}<br/>
                title: {item.title}
                <img src={item.imageUrl} style={{position: "absolute", right:"10px", width:"8vmin", height:"8vmin"}}/>
            </div>)} 
        </div>
        <table>
            <tbody>
                {[...Object.keys(addCoupon[0])].map(item => {
                return(<tr key={item}>
                    <td>{item}:</td>
                    <td><input value={addCoupon[0][item]} onChange={e => {
                            let ne = {}; ne[item] = e.target.value; 
                            let ans = Object.assign(addCoupon[0], ne);
                            console.log(ans);
                            addCoupon[1](ans);
                            forceUpdate();
                        }}
                    style={{border:"1px solid black", width:"20vw"}}/></td>
                </tr>);
                })}
                <tr>
                    <td><button style={{border: "1px solid black"}} onClick={loadList}>리스트 새로고침</button></td>
                    <td>
                        <button style={{border: "1px solid black"}} onClick={addCou}>수정/등록</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>)
}
