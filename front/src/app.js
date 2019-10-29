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

const SearchBar = ({name, getRating, show}) => {
    const Unrated = useState(false);
    
    useEffect(() => {
        if(Unrated[0]) {
            let res = []; 
            const lookup = async() => {
                return await Promise.all(show[0].map(item => {
                    if(Object.entries(item.rating).length < 4 && item.rating.constructor === Object) {
                        res.push(item);
                    }
                    return Promise.resolve('ok');
                }));
            }
            lookup().then(() => {
                show[1](res);
            })
        }
        else {
            getRating();
        }
    }, [Unrated[0]]);

    return(<div style={{display: "flex", flexDirection: "row"}}>
        <img width="50px" height="50px" src="/static/logo_white.png"/>
        <div>
            show little: <input onChange={e => name[1](e.target.value)} name="name"/>
            <button onClick={getRating}>submit</button>
        </div>
        <div>
            Look for: <input type="radio" name="show" value="unrated" 
            checked={Unrated[0]} onChange={() => {Unrated[1](!Unrated[0])}}/> Unrated
        </div>
    </div>);
}

const ReviewPostPad = ({chosen}) => {
    const addRate = useState({
        name: "",
        taste: 0,
        quantity: 0,
        atmosphere: 0,
        service: 0,
        price: "",
        location: {
            lat: 0,
            lng: 0
        }
    });
    const cate = ["taste", "quantity", "atmosphere", "service"];

    useEffect(() => {
        if(chosen[0].idx >= 0) {
            addRate[1]({
                taste: chosen[0].rating.taste,
                quantity: chosen[0].rating.quantity,
                atmosphere: chosen[0].rating.atmosphere,
                service: chosen[0].rating.service,
                location: {
                    lat: chosen[0].location.lat||0,
                    lng: chosen[0].location.lng||0
                }
            })
        }
    }, [chosen[0]]);

    const postRating = async () => {
        await Axios.post(`/admin/rating`, {...addRate[0]}, {withCredentials: true})
        .then(res => {
            window.location.reload();
        })
        .catch(err => {
            alert("error occured");
            console.log(err.data);
        })
    }

    const deletePost = async () => {
        await Axios.delete(`/admin/rating?name=${addRate[0].name}`, {withCredentials: true})
        .then(res => {
            window.location.reload();
        })
        .catch(err => {
            alert("error occured");
            console.log(err.data);
        })
    }
    const forceUpdate = useForceUpdate();

    return(<div style={{display: "flex", flexDirection: "column", width: "90vw", flexWrap:"wrap", marginTop: "30px"}}>
        <div style={{position: "relative", padding:"0% 10% 0% 10%", display: "box", width:"80vw", border:"1px solid black"}}>
            <h4 style={{fontSize: "20px"}}>가게 상세 data</h4>
            <button 
                style={{"height":"35px", width:"60px", fontSize: "16pt", "position": "absolute",border: "1px solid black", right: "30px", top: "30px"}}
                onClick={deletePost}
            >삭제</button>
            <table style={{"fontSize": "16pt"}}>
                <tbody>
                <tr>
                    <th>이름</th>
                    <th><input name="name" type="text" style={{width:"150px", height:"30px", border: "1px solid black", "fontSize": "15pt"}} value={addRate[0].name} onChange={e => addRate[1]({...addRate[0], name: e.target.value})}/></th>
                </tr>
                {cate.map(item => {
                    return(<tr key={item}>
                        <th>{item}</th>
                        <th><input name="item" style={{width:"150px", height:"30px", border: "1px solid black", "fontSize": "15pt"}}  type="number" step="0.1" value={addRate[0][item]} onChange={e => {
                            let tmp = {}; tmp[item] = e.target.value;
                            addRate[1](Object.assign(addRate[0], tmp))
                            console.log(addRate[0]);
                            forceUpdate();
                        }}/></th>
                    </tr>);
                })}
                </tbody>
            </table>
            <div style={{marginLeft: "10%", display: "flex", "flexDirection": "row"}}>
                <div>
                    가격(price)<br/>
                    <input name="price" type="text" style={{"height": "50px", "width": "200px", border: "1px solid black", "fontSize": "15pt"}} value={addRate[0].price} onChange={e => addRate[1]({...addRate[0], price: e.target.value})}/><br/>
                </div>
                <div style={{"marginLeft": "10px"}}>
                    위치정보: 
                    <input name="locationlat" type="text" style={{"height": "30px", "width": "100px", border: "1px solid black", "fontSize": "15pt"}} value={addRate[0].location.lat} onChange={e => addRate[1]({...addRate[0], location: {lat: e.target.value, lng: addRate[0].location.lng}})}/>
                    <input name="locationlng" type="text" style={{"height": "30px", "width": "100px", border: "1px solid black", "fontSize": "15pt"}} value={addRate[0].location.lng} onChange={e => addRate[1]({...addRate[0], location: {lng: e.target.value, lat: addRate[0].location.lat}})}/><br/>
                </div>
            </div>
            <hr/>
            <button style={{"height":"35px", width:"60px", "fontSize": "16pt", "position": "absolute", border: "1px solid black",right: "30px", bottom: "30px"}}onClick={postRating}>Sub</button>
        </div>
        <div style={{display: "block", width:"90vw", height:"auto", padding:"10px", border: "1px solid black", marginLeft:"20px"}}>
            <div style={{display: "flex", flexDirection:"row", flexWrap: "wrap", width: "100%", height:"20%"}}>
                {chosen[0].images.map((item, idx) => {
                return(<>
                    <img className="ImgBlock" style={{maxWidth: "17vw", height: "17vw"}} onLoad={e => {
                        console.log(idx);
                    }} src={item}/>
                </>);
                })}
            </div>
        </div>
    </div>);
}

const ResultList = ({chosen, show}) => {
    return(<div style={{height: "250px", overflow: "scroll", border:"1px solid black"}}>
        <TableStyle>
        <thead>
            <tr>
            <th className="row1">Name</th>
            <th className="row2">rating</th>
            <th className="row3">location</th>
            </tr>
        </thead>
        <tbody>
            {show[0].map((item, idx) => {
                return(<tr onClick={() => {
                    let po = item.name.match(/[가-힣a-zA-Z0-9]*/).join(' ');
                    console.log(po);
                    chosen[1]({idx: idx, name: po, rating: item.rating, images: item.imgUrls});
                }} style={{backgroundColor: chosen[0].idx === idx?"skyblue":"white"}} >
                    <td className="row1">{item.name}</td>
                    <td className="row2">{JSON.stringify(item.rating)}</td>
                    <td className="row3">{item.location}</td>
                </tr>);
            })}
        </tbody>
        </TableStyle>
    </div>);
}

const EventPad = () => {
    const addEvent = useState({
        title: "",
        code: "",
        blockId: "",
        description: "",
        imageUrl: ""
    });

    useEffect(() => {
        Axios.get(`/admin/event`, {withCredentials: true})
        .then(res => {
            console.log(res);
        });
    }, []);

    async function putEvent() {
        return await Axios.put(`/admin/event`, {...addEvent[0]}, {withCredentials: true})
        .then(res => {
            window.location.reload();
        })
        .catch(err => {
            alert("error occured");
            console.log(err.data);
        });
    }
    
    const forceUpdate = useForceUpdate();

    return(<div style={{display: "flex", flexDirection: "column", width: "90vw", flexWrap:"wrap", "marginTop": "30px"}}>
        <table>
            <tbody>
            {[...Object.keys(addEvent[0])].map(item => {
                return(<tr key={item}>
                    <td>{item}: <input value={addEvent[0][item]} onChange={e => {
                            let ne = {}; ne[item] = e.target.value; 
                            let ans = Object.assign(addEvent[0], ne);
                            console.log(ans);
                            addEvent[1](ans);
                            forceUpdate();
                        }}
                    style={{border:"1px solid black"}}/></td>
                </tr>);
            })}
            </tbody>
        </table>
        <button onClick={putEvent}>Submit</button>
    </div>);
}

const TableStyle = styled.table`
    td {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    tr {
        height: 60px;
    }
    table-layout: fixed;
    font-size: 16pt;
    width: 90vw;
    .row1 { width: 20%; } .row2 { width: 60%; } .row3 { width: 20%; }
`;

const App = () => {
    const show = useState([]);
    const name = useState("");
    const chosen = useState({idx: -1, images: []});

    const getRating = async () => {
        await Axios.get(`/admin/rating?name=${name[0]}`, {withCredentials: true})
        .then(res => {
            show[1](res.data.show);
        })
        .catch(err => {
            alert("error occured");
            console.log(err);
        });
    }

    useEffect(() => {
        getRating();
    }, []);

    return (<>
        <SearchBar name={name} getRating={getRating} show={show} />
        <ResultList show={show} chosen={chosen} />
        <ReviewPostPad chosen={chosen}/>
        <EventPad/>
    </>);
}

export default App;
