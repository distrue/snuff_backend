import React, {useState, useEffect, useCallback} from 'react';
import Axios from 'axios';
import styled from 'styled-components';
import { MinKey } from 'bson';


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

    return(<div style={{display: "flex", flexDirection: "row", marginBottom: "10px"}}>
        <div style={{fontSize: "2vh"}}>
            show: <input style={{height: "2vh", fontSize: "1.2vh", border: "1px solid black"}} onChange={e => name[1](e.target.value)} name="name"/>
            <button style={{height: "2vh", backgroundColor: "gray", fontSize: "1.2vh"}}  onClick={getRating}>submit</button>
        </div>
        <div style={{fontSize: "2vh"}}>
            <input type="checkbox" style={{height: "2vh", width: "2vh", marginLeft: "20px"}}  name="show" value="unrated" 
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
        },
        id: ""
    });
    const cate = ["taste", "quantity", "atmosphere", "service"];

    useEffect(() => {
        if(chosen[0].idx >= 0) {
            console.log(chosen[0])
            addRate[1]({
                name: chosen[0].name,
                taste: chosen[0].rating.taste,
                quantity: chosen[0].rating.quantity,
                atmosphere: chosen[0].rating.atmosphere,
                service: chosen[0].rating.service,
                price: chosen[0].rating.price,
                location: {
                    lat: chosen[0].location?chosen[0].location.lat:0,
                    lng: chosen[0].location?chosen[0].location.lng:0
                },
                _id: chosen[0]._id||""
            })
        }
    }, [chosen[0]]);

    const postRating = async () => {
        await Axios.post(`/admin/rating`, {...addRate[0]}, {withCredentials: true})
        .then(res => {
            console.log(res)
            //window.location.reload();
        })
        .catch(err => {
            alert("error occured");
            console.log(err.data);
        })
    }

    const deletePost = async () => {
        await Axios.delete(`/admin/rating?id=${addRate[0]._id}`, {withCredentials: true})
        .then(res => {
            window.location.reload();
        })
        .catch(err => {
            alert("error occured");
            console.log(err.response);
        })
    }
    const forceUpdate = useForceUpdate();

    return(<div style={{display: "flex", flexDirection: "column", width: "90vw", flexWrap:"wrap", marginTop: "30px"}}>
        <div style={{position: "relative", padding:"0% 10% 20px 10%", display: "box", width:"80vw", border:"1px solid black"}}>
            <div style={{fontSize: "2vh", fontFamily:"Roboto", paddingBottom:"10px"}}>Review data</div>
            <button 
                style={{"height":"35px", width:"60px", fontSize: "16pt", "position": "absolute",border: "1px solid black", right: "30px", top: "30px"}}
                onClick={deletePost}
            >삭제</button>
            <table>
                <tbody style={{fontSize: "1.5vh"}}>
                <tr key="main">
                    <th>이름</th>
                    <th><input name="name" type="text" style={{backgroundColor: "#cccccc", width:"20vh", height:"2vh", border: "1px solid black", "fontSize": "1.2vh"}} value={addRate[0].name}/></th>
                </tr>
                {cate.map(item => {
                    return(<tr key={item}>
                        <th key="1">{item}</th>
                        <th key="2"><input name="item" style={{width:"10vh", height:"2vh", border: "1px solid black", "fontSize": "1.2vh"}}  type="number" step="0.1" value={addRate[0][item]} onChange={e => {
                            let tmp = {}; tmp[item] = e.target.value;
                            addRate[1](Object.assign(addRate[0], tmp))
                            forceUpdate();
                        }}/></th>
                    </tr>);
                })}
                </tbody>
            </table>
            <div style={{marginLeft: "10%", display: "flex", "flexDirection": "row", fontSize: "2vh"}}>
                <div>
                    가격(price)<br/>
                    <input name="price" type="text" style={{"height": "4vh", "width": "15vh", border: "1px solid black", "fontSize": "1.2vh"}} value={addRate[0].price} onChange={e => addRate[1]({...addRate[0], price: e.target.value})}/><br/>
                </div>
                <div style={{"marginLeft": "10px"}}>
                    위치정보<br/>
                    <input name="locationlat" type="text" style={{"height": "2vh", "width": "10vh", border: "1px solid black", "fontSize": "1.2vh"}} value={addRate[0].location.lat} onChange={e => addRate[1]({...addRate[0], location: {lat: e.target.value, lng: addRate[0].location.lng}})}/>
                    <input name="locationlng" type="text" style={{"height": "2vh", "width": "10vh", border: "1px solid black", "fontSize": "1.2vh"}} value={addRate[0].location.lng} onChange={e => addRate[1]({...addRate[0], location: {lng: e.target.value, lat: addRate[0].location.lat}})}/><br/>
                </div>
            </div>
            <button style={{"height":"35px", width:"60px", "fontSize": "16pt", "position": "absolute", border: "1px solid black",right: "30px", bottom: "30px"}}onClick={postRating}>Sub</button>
        </div>
        <div style={{display: "block", width:"90vw", height:"auto", padding:"10px", border: "1px solid black", marginLeft:"20px"}}>
            <div style={{display: "flex", flexDirection:"row", flexWrap: "wrap", width: "100%", height:"20%"}}>
                {chosen[0].images.map((item, idx) => {
                return(<>
                    <img className="ImgBlock" style={{maxWidth: "17vw", height: "17vw"}} src={item}/>
                </>);
                })}
            </div>
        </div>
    </div>);
}

const ResultList = ({chosen, show}) => {
    return(<div style={{maxHeight: "33vh", overflow: "scroll", paddingBottom:"20px",border:"1px solid black"}}>
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
                return(<tr key={idx} onClick={() => {
                    let po = item.name.match(/[가-힣a-zA-Z0-9]+/).join(' ');
                    chosen[1]({idx: idx, name: po, rating: item.rating, location:item.location, images: item.imgUrls, _id: item._id});
                }} style={{backgroundColor: chosen[0].idx === idx?"skyblue":"white"}} >
                    <td className="row1">{item.name}</td>
                    <td className="row2">{JSON.stringify(item.rating)}</td>
                    <td className="row3">{JSON.stringify(item.location)}</td>
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
            console.log(res.data);
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

const Selector = ({idPage}) => {
    return(<SelectorStyle>
        <div className="item" onClick={() => idPage[1]("review")}>
            <NavBarText width="20px">리뷰수정</NavBarText>
        </div>
        <div className="item" onClick={() => idPage[1]("event")}>
            <NavBarText width="40px">이벤트</NavBarText>
        </div>
        <div className="item" onClick={() => idPage[1]("newReview")}>
            <NavBarText width="20px">리뷰추가</NavBarText>
        </div>
    </SelectorStyle>);
}

const SelectorStyle = styled.div`
  position: fixed;
  display: flex; flex-direction: row;
  bottom: 0;
  width: 100vw;
  height: 5vh;
  box-shadow: 0 -2px 2px 0 rgba(0, 0, 0, 0.16);
  background-color: #ffffff;
  .item {
      width: 30%; height: 100%;
      position: relative;
      display: block;
  }
`;

// width를 위해 분리함, 나머지는 NavBar에 넣을 것!
const NavBarText = styled.div`
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Noto Sans KR';
    font-size: 2vh;
    width: auto; height: auto;
    overflow: hidden;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1;
    letter-spacing: normal;
    text-align: center;
    color: #003a2b;
`;

const NewReview = () => {
    const raw = useState('');

    const putReview = () => {
        Axios.put('/admin/rating', {raw: raw[0]}, {withCredentials: true})
        .then(ans => {
            alert(ans.data)
        })
        .catch(err => {
            console.log(err.response)
        })
    }

    return(<>
        <h2>리뷰 추가</h2>
        <br/>
        <textarea type="text" style={{width: "80vw", height: "40vh", overflow: "scroll", border:"1px solid black"}}
        value={raw[0]} onChange={e => raw[1](e.target.value)}/>
        <button onClick={putReview}>Submit</button>
    </>)
}

const App = () => {
    const show = useState([]);
    const name = useState("");
    const chosen = useState({idx: -1, images: []});
    const idPage = useState("review");

    const getRating = async () => {
        await Axios.get(`/admin/rating?name=${name[0]}`, {withCredentials: true})
        .then(res => {
            show[1](res.data.show || []);
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
        <div id="review" style={{display:idPage[0] === "review"?"block":"none"}}>
            <SearchBar name={name} getRating={getRating} show={show} />
            <ResultList show={show} chosen={chosen} />
            <ReviewPostPad chosen={chosen}/>
        </div>
        <div id="event" style={{display:idPage[0] === "event"?"block":"none"}}>
            <EventPad/>
        </div>
        <div id="newReview" style={{display:idPage[0] === "newReview"?"block":"none"}}>
            <NewReview/>
        </div>
        <Selector idPage={idPage}/>
    </>);
}

export default App;
