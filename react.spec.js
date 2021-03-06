import {InputCell, ComputeCell, CallbackCell} from './react'

describe('React module', () => {
  test('accepts input', () => {
    const inputCell = new InputCell(10)
    expect(inputCell.getValue()).toEqual(10)
  })

  xtest('allows input cell value to be set', () => {
    const inputCell = new InputCell(4)
    inputCell.setValue(20)
    expect(inputCell.getValue()).toEqual(20)
  })

  xtest('allows setting compute cells', () => {
    const inputCell = new InputCell(1)
    const fn = inputCells => inputCells[0].getValue() + 1
    const computeCell = new ComputeCell([inputCell], fn)
    expect(computeCell.getValue()).toEqual(2)
  })

  xtest('allows compute cell to use input cell value', () => {
    const inputCell = new InputCell(2)
    const fn = inputCells => inputCells[0].getValue() + 1
    const computeCell = new ComputeCell([inputCell], fn)
    expect(computeCell.getValue()).toEqual(3)
  })

  xtest('allows compute cell to alert provided function', () => {
    const inputCell = new InputCell(1)
    const fn = inputCells => inputCells[0].getValue() + 2
    const computeCell = new ComputeCell([inputCell], fn)
    expect(computeCell.getValue()).toEqual(3)
  })

  xtest('compute cell takes inputs in correct order', () => {
    const inputCells = [
      new InputCell(1),
      new InputCell(2)
    ]

    const computeCell = new ComputeCell(
      inputCells,
      inputs => inputs[0].getValue() + inputs[1].getValue() * 10
    )

    expect(computeCell.getValue()).toEqual(21)
  })

  xtest('compute cells update value when inputs are changed', () => {
    const inputCell = new InputCell(1)
    const computeCell = new ComputeCell(
      [inputCell],
      inputs => inputs[0].getValue() + 1
    )
    inputCell.setValue(3)
    expect(computeCell.getValue()).toEqual(4)
  })

  xtest('compute cells can depend on other compute cells', () => {
    const inputCell = new InputCell(1)
    const timesTwo = new ComputeCell(
      [inputCell],
      inputs => inputs[0].getValue() * 2
    )

    const timesThirty = new ComputeCell(
      [inputCell],
      inputs => inputs[0].getValue() * 30
    )

    const sum = new ComputeCell(
      [timesTwo, timesThirty],
      inputs => inputs[0].getValue() + inputs[1].getValue()
    )

    expect(sum.getValue()).toEqual(32)

    inputCell.setValue(3)
    expect(sum.getValue()).toEqual(96)
  })

  xtest('has defined CallbackCell', () => {
    const callback = new CallbackCell(cell => cell.getValue())
    expect(callback.getValue()).toEqual([])
  })

  xtest('has CallbackCell which stores values', () => {
    const callback = new CallbackCell(cell => cell.getValue())
    callback.alert(new InputCell(1))
    callback.alert(new InputCell(2))

    expect(callback.getValue()).toEqual([1, 2])
  })

  xtest('compute cells fire callbacks', () => {
    const inputCell = new InputCell(1)
    const output = new ComputeCell(
      [inputCell],
      inputs => inputs[0].getValue() + 1
    )

    const callback = new CallbackCell(cell => cell.getValue())
    output.addListener(callback)

    inputCell.setValue(3)
    expect(callback.getValue()).toEqual([4])
  })

  xtest('callbacks fire only when output values change', () => {
    const inputCell = new InputCell(1)
    const output = new ComputeCell(
      [inputCell],
      inputs => inputs[0].getValue() < 3 ? 111 : 222
    )

    const callback = new CallbackCell(cell => cell.getValue())
    output.addListener(callback)

    inputCell.setValue(2)
    expect(callback.getValue()).toEqual([])

    inputCell.setValue(4)
    expect(callback.getValue()).toEqual([222])
  })

  xtest('callbacks can be added and removed', () => {
    const inputCell = new InputCell(1)
    const output = new ComputeCell(
      [inputCell],
      inputs => inputs[0].getValue() + 1
    )

    const callback1 = new CallbackCell(cell => cell.getValue())
    const callback2 = new CallbackCell(cell => cell.getValue())

    output.addListener(callback1)
    output.addListener(callback2)

    inputCell.setValue(31)

    output.removeListener(callback1)

    const callback3 = new CallbackCell(cell => cell.getValue())
    output.addListener(callback3)

    inputCell.setValue(41)

    expect(callback1.getValue()).toEqual([32])
    expect(callback2.getValue()).toEqual([32, 42])
    expect(callback3.getValue()).toEqual([42])
  })

  xtest('removing a callback multiple times doesn\'t interfere with other callbacks', () => {
    const inputCell = new InputCell(1)
    const output = new ComputeCell(
      [inputCell],
      inputs => inputs[0].getValue() + 1
    )

    const callback1 = new CallbackCell(cell => cell.getValue())
    const callback2 = new CallbackCell(cell => cell.getValue())

    output.addListener(callback1)
    output.addListener(callback2)

    output.removeListener(callback1)
    output.removeListener(callback1)
    output.removeListener(callback1)

    inputCell.setValue(2)

    expect(callback1.getValue()).toEqual([])
    expect(callback2.getValue()).toEqual([3])
  })

  xtest('callbacks should only be called once, even if multiple dependencies change', () => {
    const inputCell = new InputCell(1)
    const plusOne = new ComputeCell(
      [inputCell],
      inputs => inputs[0].getValue() + 1
    )

    const minusOne1 = new ComputeCell(
      [inputCell],
      inputs => inputs[0].getValue() - 1
    )

    const minusOne2 = new ComputeCell(
      [minusOne1],
      inputs => inputs[0].getValue() - 1
    )

    const output = new ComputeCell(
      [plusOne, minusOne2],
      inputs => inputs[0].getValue() * inputs[1].getValue()
    )

    const callback1 = new CallbackCell(cell => cell.getValue())
    output.addListener(callback1)

    inputCell.setValue(4)

    expect(callback1.getValue()).toEqual([10])
  })

  xtest('callbacks should not be called if dependencies change but output value doesn\'t change', () => {
    const inputCell = new InputCell(1)
    const plusOne = new ComputeCell(
      [inputCell],
      inputs => inputs[0].getValue() + 1
    )

    const minusOne = new ComputeCell(
      [inputCell],
      inputs => inputs[0].getValue() - 1
    )

    const alwaysTwo = new ComputeCell(
      [plusOne, minusOne],
      inputs => inputs[0].getValue() - inputs[1].getValue()
    )

    const callback = new CallbackCell(cell => cell.getValue())
    alwaysTwo.addListener(callback)

    inputCell.setValue(2)
    inputCell.setValue(3)
    inputCell.setValue(4)
    inputCell.setValue(5)

    expect(callback.getValue()).toEqual([])
  })

  xtest('setting a input cell value without changing it does not trigger a callback', () => {
    const inputCell = new InputCell(1)
    const callbackCell = new CallbackCell(cell => cell.getValue())

    inputCell.addListener(callbackCell)

    inputCell.setValue(1)

    expect(callbackCell.getValue()).toEqual([])
  })
})
