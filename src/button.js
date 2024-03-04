const buttons = {};

class Button
{
    _onClick(e)
    {
        const funcs = this.state%2==1 ? this.offEvents : this.onEvents;
        this.state += 1;
        for (const [id,func] of Object.entries(funcs))
        {
            func(e)
        }
    }

    constructor(id)
    {
        this.id = id;
        this.onEvents = {}
        this.offEvents = {}
        this.onIds = 0;
        this.offIds = 0;
        this.state = 0;
        buttons[this.id] = this;

        // we want to pass down e so forced to use function(e) instead of e =>
        //      as using this in later gives class instance
        $(`#${this.id}`).on('click', function(e) {
            const id = $(this).attr('id');
            if (id in buttons) buttons[id]._onClick(e);
            else throw new Error(`didn't find ${id} in buttons`)
        });
    }

    addOnFunc(func)
    {
        this.onEvents[this.onIds] = func;
        const oldId = this.onIds;
        this.onIds += 1;
        return oldId;
    }

    addOffFunc(func)
    {
        this.offEvents[this.offIds] = func;
        const oldId = this.offIds;
        this.offIds += 1;
        return oldId;
    }

    removeOnFunc(id)
    {
        if (!(id in this.onEvents)) throw new Error(`key ${id} not in on funcs`)
        delete this.onEvents[id]
    }

    removeOnFunc(id)
    {
        if (!(id in this.offEvents)) throw new Error(`key ${id} not in off funcs`)
        delete this.offEvents[id]
    }
};

/*
transition for values of stateTransitions indicating classes which should be
    on text at end of animation

text1
    0: anim-mid
    1: anim-mid anim-out
    2: anim-start anim-in
    3: anim-mid anim-out
    4: anim-start anim-in

text2
    0: anim-start
    1: anim-start anim-in
    2: anim-start anim-out
    3: anim-start anim-in
    4: anim-start anim-out
*/
const transitionFunc = function(e, stateTransitions) {
    const children = $(e.currentTarget).children();
    const text1 = children[0];
    const text2 = children[1];

    if (stateTransitions%2==1)
    {
        $(text1)
            .removeClass('text-anim-start text-anim-in')
            .addClass('text-anim-mid text-anim-out');
        $(text2)
            .removeClass('text-anim-out')
            .addClass('text-anim-in');
    }
    else
    {
        $(text1)
            .removeClass('text-anim-mid text-anim-out')
            .addClass('text-anim-start text-anim-in');
        $(text2)
            .removeClass('text-anim-in')
            .addClass('text-anim-out');
    }
};
