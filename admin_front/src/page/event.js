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


export const EventList = ({eventList, chosenEvent}) => {
    useEffect(() => {
        Axios.get(`/admin/event`, {withCredentials: true})
        .then(res => {
            eventList[1](res.data);
        });
    }, []);

    return(<div style={{display: "flex", flexDirection: "column", height: "50vh", width:"85vw", overflow:"scroll", backgroundColor: "#cccccc"}}>
        {eventList[0].map(item => <div style={{width: "80vw", height: "10vh", padding: "10px", overflow: "scroll", border: "1px solid black",  position: "relative", backgroundColor: "white"}} onClick={e => chosenEvent[1](item)}>
            코드: {item.code} / blockId: {item.blockId}<br/>
            설명: {item.description}<br/>
            참가자: {item.participants.length}<br/>
            마감일: {item.expireDate}<br/>
            {item.reward?JSON.stringify(item.reward):""}
            <img style={{width: "10vh", height:"10vh", position: "absolute", right: "10px", border:"1px solid black", top: "10px"}} src={item.imageUrl}/>
        </div>)}
    </div>)
}

export const EventDetail = ({chosenEvent, chosenParticipant}) => {
    return(<div>
        <div style={{width: "80vw", height: "20vh", padding: "10px", overflow: "scroll", border: "1px solid black",  position: "relative", backgroundColor: "white"}}>
            <div style={{width: "80%"}}>
            <table>
                <thead>
                    <th>participant</th>
                    <th>Reward</th>
                </thead>
                <tbody>
                {chosenEvent[0].participants?chosenEvent[0].participants.map(item => 
                    <tr onClick={e => {chosenParticipant[1](item)}}><td>{item.name}</td><td>{chosenEvent[0].reward?chosenEvent[0].reward[item._id]:""}</td></tr>
                ):""}
                </tbody>
            </table>
            </div>
            <img style={{width: "18vh", height:"18vh", position: "absolute", right: "10px", border:"1px solid black", top: "10px"}} src={chosenEvent[0]?chosenEvent[0].imageUrl:""}/>
        </div>
    </div>)
}

export const EventFixPad = ({eventList, chosenEvent, chosenParticipant}) => {
    const addEvent = useState({
        title: "",
        code: "",
        blockId: "",
        description: "",
        imageUrl: ""
    });
    const fixParticipant = useState({
        participant: "",
        reward: ""
    })

    async function putEvent() {
        return await Axios.post(`/admin/event`, {...addEvent[0]}, {withCredentials: true})
        .then(res => {
            window.location.reload();
        })
        .catch(err => {
            alert("error occured");
            console.log(err.data);
        });
    }

    useEffect(() => {
        console.log(chosenParticipant[0])
        fixParticipant[1]({
            ...fixParticipant[0],
            participant: chosenParticipant[0]._id
        })
    }, [chosenParticipant[0]])
    
    const forceUpdate = useForceUpdate();

    function addParticipant() {
        Axios.post('/admin/event/participant', {event: chosenEvent[0]._id, participant: fixParticipant[0].participant, reward: fixParticipant[0].reward}, {withCredentials: true})
        .then(data=> {
            console.log(data)
        })
    }

    function delParticipant() {
        Axios.delete(`/admin/event/participant?event=${chosenEvent[0]._id}&participant=${fixParticipant[0].participant}`, {withCredentials: true})
        .then(data=> {
            console.log(data)
        })
    }

    return(<div style={{display: "flex", flexDirection: "row", width: "90vw", flexWrap:"wrap", "marginTop": "30px"}}>
        <table style={{marginRight:"30px"}}>
            <tbody>
            {[...Object.keys(addEvent[0])].map(item => {
                return(<tr key={item}>
                    <td>{item}</td>
                    <td> <input value={addEvent[0][item]} onChange={e => {
                            let ne = {}; ne[item] = e.target.value; 
                            let ans = Object.assign(addEvent[0], ne);
                            console.log(ans);
                            addEvent[1](ans);
                            forceUpdate();
                        }}
                    style={{border:"1px solid black"}}/></td>
                </tr>);
            })}
            <tr>
                <td></td>
                <td><button onClick={putEvent}>New Event Submit</button></td>
            </tr>
            </tbody>
        </table>
        <table>
            <tbody>
                <tr><td>Event</td><td style={{textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap"}}>{chosenEvent[0].title}</td></tr>
                {[...Object.keys(fixParticipant[0])].map(item => {
                return(<tr key={item}>
                    <td>{item}:</td>
                    <td><input value={fixParticipant[0][item]} onChange={e => {
                            let ne = {}; ne[item] = e.target.value; 
                            let ans = Object.assign(fixParticipant[0], ne);
                            console.log(ans);
                            fixParticipant[1](ans);
                            forceUpdate();
                        }}
                    style={{border:"1px solid black", width:"20vw"}}/></td>
                </tr>);
                })}
                <tr>
                    <td>
                        <button style={{border: "1px solid black"}} onClick={delParticipant}>삭제</button>
                    </td>
                    <td>
                        <button style={{border: "1px solid black"}} onClick={addParticipant}>수정/등록</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <button style={{width: "100px", height:"100px", backgroundColor: "#12f410", margin: "0px 20px 0px 20px"}} onClick={() => {
            Axios.get(`/admin/event`, {withCredentials: true})
            .then(res => {
                eventList[1](res.data);
                chosenEvent[1](""); chosenParticipant[1]("")
            });
        }}>Data Reload</button>
    </div>);
}
