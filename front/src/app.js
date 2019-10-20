import React, {useState, useEffect} from 'react';
import {BACK_URL} from '../config';
import Axios from 'axios';
import styled from 'styled-components';

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
        <img width="50px" src="/static/logo_white.png"/>
        <div>
            show little: <input onChange={e => name[1](e.target.value)} name="name"/>
            <button onClick={getRating}>submit</button>
        </div>
        <div>
            Look for: <input type="radio" name="show" value="unrated" 
            checked={Unrated[0]} onClick={() => {Unrated[1](!Unrated[0])}}/> Unrated
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
        locationURL: ""
    });
    const cate = ["taste", "quantity", "atmosphere", "service"];

    useEffect(() => {
        if(chosen[0].idx >= 0) {
            addRate[1]({
                name: chosen[0].name,
                taste: chosen[0].rating.taste,
                quantity: chosen[0].rating.quantity,
                atmosphere: chosen[0].rating.atmosphere,
                service: chosen[0].rating.service,
                price: chosen[0].rating.service
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

    return(<div style={{display: "flex", flexDirection: "row", width: "90vw", flexWrap:"wrap"}}>
        <div style={{padding:"0% 10% 0% 10%", display: "box", width:"500px", border:"1px solid black"}}>
            <h4>점수 입력</h4>
            <table>
                <tr>
                    <th>이름</th>
                    <th><input name="name" type="text" value={addRate[0].name} onChange={e => addRate[1]({...addRate[0], name: e.target.value})}/></th>
                </tr>
                {cate.map(item => {
                    return(<tr>
                        <th>{item}</th>
                        <th><input name="item" type="number" step="0.1" value={addRate[0][item]} onChange={e => {
                            let tmp = {}; tmp[item] = e.target.value;
                            addRate[1](Object.assign(addRate[0], tmp))
                            console.log(addRate[0]);
                        }}/></th>
                    </tr>);
                })}
            </table>
            <div style={{marginLeft: "10%"}}>
                가격(price)<br/>
                <input name="price" type="text" style={{"height": "50px", "width": "200px"}} value={addRate[0].price} onChange={e => addRate[1]({...addRate[0], price: e.target.value})}/><br/>
            </div>
            <hr/>
            <div>
                위치정보: <input name="locationURL" type="text" style={{"height": "30px", "width": "200px"}} value={addRate[0].locationURL} onChange={e => addRate[1]({...addRate[0], locationURL: e.target.value})}/><br/>
            </div>
            <hr/>
            <button onClick={postRating}>Submit</button>
        </div>
        <div style={{display: "block", width:"400px", padding:"10px", border: "1px solid black", marginLeft:"20px"}}>
            <h3>Restaurant image</h3>
            <div style={{display: "flex", flexDirection:"row", flexWrap: "wrap", width: "100%", height:"20%"}}>
                {chosen[0].images.map((item, idx) => {
                return(<>
                    <img class="ImgBlock" style={{maxWidth: "20%"}} onLoad={e => {
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
            <th class="row1">Name</th>
            <th class="row2">rating</th>
            <th class="row3">locationURL</th>
            </tr>
        </thead>
        <tbody>
            {show[0].map((item, idx) => {
                return(<tr onClick={() => {
                    chosen[1]({idx: idx, name: item.name, rating: item.rating, images: item.imgUrls});
                }} style={{backgroundColor: chosen[0].idx === idx?"skyblue":"white"}} >
                    <td>{item.name}</td>
                    <td>{JSON.stringify(item.rating)}</td>
                    <td>{item.locationURL}</td>
                </tr>);
            })}
        </tbody>
        </TableStyle>
    </div>);
}

const TableStyle = styled.table`
    .td {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
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
    </>);
}

export default App;
