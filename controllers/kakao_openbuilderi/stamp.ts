export function myScoreBlock(data: any) {
    return({
        "version": "2.0",
        "template": {
          "outputs": [
            {
                "basicCard": {
                    "title": `내 적립: ${data.log.length}`,
                    "description": data.eventRule.description,
                    "buttons": [{
                      "action": "message",
                      "label": "리워드 보기",
                      "messageText": `eventRule ${data.eventRule.code}`
                    },
                    {  // 현재는 static하게, 이후에 policy에 대해 불러올 것
                      "action": "block",
                      "label": "0개 보상받기",
                      "blockId": `5db59a4992690d0001a4f1ee`
                    }
                    ],
                    "thumbnail": {
                      "imageUrl": "https://snuffstatic.s3.ap-northeast-2.amazonaws.com/myReward.png"
                    }
                }
            }]
        }
    })
}

export function eventRuleBlock(data: any) {
    return({
        "version": "2.0",
        "template": {
          "outputs": [
            {
                "basicCard": {
                    "title": data.title,
                    "description": data.description,
                    "buttons": [{
                      "action": "message",
                      "label": "내적립현황",
                      "messageText": `myScore ${data.code}`
                    }
                    ],
                    "thumbnail": {
                      "imageUrl": data.imageUrl
                    }
                }
            }]
        }
    })
}
