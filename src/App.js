import logo from './logo.svg';
import './App.css';
import { useState, useLayoutEffect } from 'react';

const fetcher = async () => {
  try {
    const res = await fetch("https://944ba3c5-94c3-4369-a9e6-a509d65912e2.mock.pstmn.io/get", {
      method: "GET",
      headers: {
        "X-Api-Key": "PMAK-5ef63db179d23c004de50751-10300736bc550d2a891dc4355aab8d7a5c",
      }
    });
    return await res.json();
  } catch (e) {
    console.error(e);
    return false;
  }
}

const patcher = async (id, data) => {
  try {
    const res = await fetch(`https://944ba3c5-94c3-4369-a9e6-a509d65912e2.mock.pstmn.io/patch/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "X-Api-Key": "PMAK-5ef63db179d23c004de50751-10300736bc550d2a891dc4355aab8d7a5c",
      }
    });
    return await res.json();
  } catch (e) {
    console.error(e);
    return false;
  }
}

const decideStatus = (dueDate, isComplete) => {
  const dueDateObject = dueDate ? Date.parse(dueDate) : false;
  // console.info(dueDateObject < new Date());
  const overdue = !isComplete && dueDateObject && (dueDateObject < new Date());
  let status = overdue && !isComplete ? "overdue" : "unComplete";
  status = isComplete ? "isComplete" : status;
  return { overdue, status };
}

const ListItem = ({ id, description, isComplete, dueDate, status }) => {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    isComplete, status
  });

  const colorSet = {
    overdue: "#EC9192",
    unComplete: "#EEEEEE",
    isComplete: "#729EA1"
  }

  const handleClick = async () => {
    setLoading(true);
    const res = await patcher(id, {
      isComplete: !state.isComplete
    });
    console.log('res', res);
    if (res && res.status) {
      const { _, status } = decideStatus(dueDate, !state.isComplete);
      // console.log('status', status);
      setState({
        isComplete: !state.isComplete,
        status
      });
    }
    setLoading(false);
  }

  return (
    <div style={{
      backgroundColor: colorSet[state.status],
    }}>
      <label>
        <div className="my-2 py-1 px-2 flex flex-row justify-between">
          <div>
            {
              loading ?
                <div className="mr-2 loadingio-spinner-rolling-small"><div className="ldio-small"><div></div></div></div>
                :
                <input className='mr-2' type="checkbox" checked={state.isComplete} onClick={handleClick} />
            }
            <span className="select-none" style={{ textDecoration: state.isComplete && "line-through" }}>{description}</span>
          </div>
          <div>
            <span className="select-none">{dueDate ? dueDate.split("T")[0].replaceAll("-", "/") : ""}</span>
          </div>
        </div>
      </label>
    </div>
  )
}

function App() {
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState([]);
  useLayoutEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetcher();
      if (res) {
        const listItems = res.map((elem) => {
          // const dueDateObject = elem.dueDate ? Date.parse(elem.dueDate) : false;
          // // console.info(dueDateObject < new Date());
          // const overdue = !elem.isComplete && dueDateObject && (dueDateObject < new Date());
          // let status = overdue && !elem.isComplete ? "overdue" : "unComplete";
          const { overdue, status } = decideStatus(elem.dueDate, elem.isComplete);
          return {
            ...elem,
            overdue,
            status
          }
        });

        let overdueList = listItems.filter((elem) => elem.overdue);
        let todoList = listItems.filter((elem) => !elem.overdue && !elem.isComplete);
        let doneList = listItems.filter((elem) => elem.isComplete);

        const resultItems = [
          ...overdueList.sort((a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate)),
          ...todoList.sort((a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate)),
          ...doneList.sort((a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate))
        ]

        setListData(resultItems);
      }
      setLoading(false);
    }
    fetchData();
  }, []);
  return (
    <div className="App">
      <div className='pl-2 font-medium leading-tight text-xl mt-0 mb-2 text-white bg-blue-800 leading-loose text-left'>
        Todo App
      </div>
      <div className='w-96 mx-auto'>
        {
          loading ?
            <div className="mr-2 loadingio-spinner-rolling-big"><div className="ldio-big"><div></div></div></div>
            :
            listData.map((elem, index) => <ListItem key={index} id={elem.id} description={elem.description} isComplete={elem.isComplete} dueDate={elem.dueDate} status={elem.status} />)
        }
      </div>
    </div>
  );
}

export default App;
