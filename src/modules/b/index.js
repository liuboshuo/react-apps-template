import React from 'react'
import ReactDom from 'react-dom'
import "./app.less"

class App extends React.Component {
    render(){
        console.log(process.env.APP_ENV)
        return (
            <div class="test">
                hello react-apps-template b
            </div>
        )
    }
}

ReactDom.render(<App/>,document.getElementById("app"))
