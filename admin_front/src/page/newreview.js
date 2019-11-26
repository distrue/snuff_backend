import React, {useState, useEffect, useCallback} from 'react';
import Axios from 'axios';
import styled from 'styled-components';


export const NewReview = () => {
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