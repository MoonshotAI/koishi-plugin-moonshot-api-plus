import { Context } from 'koishi'

export async function sendStableDiffusionRequest(ctx: Context, apiUrl: string, requestPayload: object) {
    for(let i = 1; i <= 3; i++) {
        console.log('image try attempt ' + i);
        try {
            const response = await ctx.http.axios(apiUrl + '/sdapi/v1/txt2img', {
                method: 'POST',
                timeout: 1000000,
                data: requestPayload,
              })
            
            return response;
        } catch (error) {
            if (error.response) {
                console.log(error.response.status);
                console.log(error.response.data);
            } else {
                console.log(error.code);
            }
        }
    }
}

