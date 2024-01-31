## qince-imagedetect
### install
```npm
npm install qince-imagedetect
```

### usage
#### 小程序
```javascript
import utils from 'qince-imagedetect';

wx.chooseMedia({
  ...
  success: async (res) => {
    const files = res.tempFiles || []
    const file = files[0]
    /**
     * checkLuminance
     * @return Promise 
     * {
     *  brightness: Number, // 明暗值
     *  isBright: Boolean,  // 是否过亮
     *  isGray: Boolean,    // 是否过暗
     * }
     * 
    */
    const luminance = await utils.checkLuminance(file?.tempFilePath)
    /**
     * checkDim
     * @return Promise 
     * {
     *  averageDiff: Number, // 模糊值
     *  isClear: Boolean,  // 是否清晰
     * }
    */
    const dim = await utils.checkDim(file?.tempFilePath)
  }
})

```

#### react demo
```javascript
import React, { useState } from 'react'
import utils from 'qince-imagedetect';
import { ImageUploader } from 'antd-mobile'

export default () => {
  const [fileList, setFileList] = useState([])
  
  const handleDetect = async (files) => {
    const url = files[files?.length - 1]?.url
    const luminance = await checkLuminance(url)
    const dim = await checkDim(url)
  }

  return <ImageUploader value={fileList} onChange={handleDetect} />

}
```