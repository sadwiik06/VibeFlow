import React from 'react';
const ConversationList = ({conversations,selectedId,onSelect, currentUserId})=>{
    const getOtherParticipant = (conv)=>{
        return conv.participants.find(p=>p._id!==currentUserId);

    };
    return (
        <div>
            <h3 style={{padding:'15px'}}>Messages</h3>
            {conversations.map(conv=>{
                const otherUser = getOtherParticipant(conv);
                return (
                    <div 
                    key={conv._id}
                    onClick={()=>onSelect(conv)}
                    style={{
                        display:'flex',
                        alignItems:'center',
                        padding: '10px 15px',
                        cursor: 'pointer',
                        backgroundColor: selectedId === conv._id? '#f0f0f0':'white',
                        borderBottom: '1px solid #eee',


                    }}
                    >
                        <img
                        src = {otherUser.profilePicture || '/default-avatar.png'}
                        alt=""
                        style={{width:'50px',height:'50px',borderRadius:'50%',marginRight:'10px'}}
                        />
                        <div style={{flex:1}}>
                            <div style={{fontWeight:'bold'}}>{otherUser.username}</div>
                            {conv.lastMessage && (
                                <div style={{fontSize: '0.9rem', color:'#666'}}>
                                    {conv.lastMessage.sender === currentUserId? 'You: ':''}
                                    {conv.lastMessage.text.substring(0,30)}
                                </div>
                            )}
                        </div>
                        </div>

                )
            })}
        </div>
    )
}
export default ConversationList;
