// triggers when the ultrasonar finds an object and checks if there is an ir signal and fires a ir signal when there is none
function cattower () {
    CatCar.maakAchterlampen(0, 100, 0)
    CatCar.stoppenrijden()
    basic.pause(200)
    CatCar.maakAchterlampen(0, 0, 0)
    // ir transistor
    if (pins.analogReadPin(AnalogPin.P3) < 800) {
        for (let index = 0; index < 2; index++) {
            basic.pause(250)
            CatCar.maakKoplampen(100, 100, 100)
            CatCar.maakAchterlampen(0, 100, 0)
            basic.pause(250)
            CatCar.maakKoplampen(0, 0, 0)
            CatCar.maakAchterlampen(0, 0, 0)
        }
    } else {
        // ir led
        pins.digitalWritePin(DigitalPin.P9, 1)
        basic.pause(1000)
        pins.digitalWritePin(DigitalPin.P9, 0)
    }
    while (rijden) {
        lijnLinks = CatCar.Line_Sensor(CatCar.lijnSensor.links, CatCar.lijnKleur.zwart)
        lijnRechts = CatCar.Line_Sensor(CatCar.lijnSensor.rechts, CatCar.lijnKleur.zwart)
        // draai links
        // draai rechts
        // check kleursensor
        if (lijnLinks && !(lijnRechts)) {
            CatCar.draaien(CatCar.Turn.links, 25)
            CatCar.maakAchterlampen(100, 0, 0)
        } else if (!(lijnLinks) && lijnRechts) {
            CatCar.draaien(CatCar.Turn.rechts, 25)
            CatCar.maakAchterlampen(0, 0, 100)
        } else if (lijnLinks && lijnRechts) {
            CatCar.rijden(CatCar.Directions.achterwaards, 10)
            // todo: check colour sensor
            if (CatCar.checkColour(NeoPixelColors.Red)) {
                CatCar.stoppenrijden()
                return
            } else if (CatCar.checkColour(NeoPixelColors.Blue)) {
                CatCar.stoppenrijden()
                return
            }
        } else {
            CatCar.rijden(CatCar.Directions.achterwaards, 20)
        }
        basic.pause(10)
    }
    CatCar.stoppenrijden()
    return
}
function knipperlicht (links: boolean, rechts: boolean, tijd: number) {
    if (links) {
        CatCar.maakAchterlampen(100, 0, 0)
        music.playTone(349, music.beat(BeatFraction.Sixteenth))
        basic.pause(tijd)
        CatCar.maakAchterlampen(0, 0, 0)
        music.playTone(262, music.beat(BeatFraction.Sixteenth))
    } else if (rechts) {
        CatCar.maakAchterlampen(0, 0, 100)
        music.playTone(349, music.beat(BeatFraction.Sixteenth))
        basic.pause(tijd)
        CatCar.maakAchterlampen(0, 0, 0)
        music.playTone(262, music.beat(BeatFraction.Sixteenth))
    }
}
// start following the line
input.onButtonPressed(Button.A, function () {
    if (!(remoteControl) && buttonsActive && !(rijden)) {
        CatCar.maakKoplampen(50, 50, 50)
        music.playTone(659, music.beat(BeatFraction.Whole))
        music.rest(music.beat(BeatFraction.Whole))
        music.playTone(659, music.beat(BeatFraction.Whole))
        CatCar.maakMiddenLeds(0, 0, 0)
        rijden = true
    }
})
input.onButtonPressed(Button.AB, function () {
    if (buttonsActive) {
        if (!(rijden)) {
            // remote control
            buttonsActive = false
            group = 0
            while (input.buttonIsPressed(Button.A)) {
                basic.pause(100)
            }
            while (!(input.buttonIsPressed(Button.A))) {
                if (input.buttonIsPressed(Button.B)) {
                    group += 1
                    strip.setPixelColor(5 - group, neopixel.colors(NeoPixelColors.Red))
                    if (group > 5) {
                        group = 0
                        strip.clear()
                    }
                    strip.show()
                    while (input.buttonIsPressed(Button.B)) {
                        basic.pause(25)
                    }
                }
                basic.pause(25)
            }
            radio.setGroup(group)
            strip.clear()
            for (let index = 0; index <= group; index++) {
                strip.setPixelColor(5 - index, neopixel.colors(NeoPixelColors.Green))
            }
            strip.show()
            buttonsActive = true
            remoteControl = true
        }
    }
})
// stops the linefollow and the remote control
input.onButtonPressed(Button.B, function () {
    if (buttonsActive) {
        rijden = false
        remoteControl = false
        strip.clear()
        strip.show()
        basic.pause(25)
        CatCar.stoppenrijden()
        CatCar.maakKoplampen(0, 0, 0)
        CatCar.maakAchterlampen(0, 0, 0)
        CatCar.maakMiddenLeds(100, 100, 100)
    }
})
radio.onReceivedValue(function (name, value) {
    if (remoteControl) {
        if (name == "stop") {
            CatCar.stoppenrijden()
        } else if (name == "rijden") {
            CatCar.rijden(CatCar.Directions.voorwaards, value)
        } else if (name == "links") {
            CatCar.draaien(CatCar.Turn.links, value)
        } else if (name == "rechts") {
            CatCar.draaien(CatCar.Turn.rechts, value)
        } else if (name == "back") {
            CatCar.rijden(CatCar.Directions.achterwaards, value)
        } else if (name == "lampen") {
            if (value == 0) {
                CatCar.maakKoplampen(0, 0, 0)
            } else {
                CatCar.maakKoplampen(100, 100, 100)
            }
        } else if (name == "sonar") {
            radio.sendNumber(CatCar.sonar())
        }
    }
})
let idleAnimation = 0
let sonar = 0
let group = 0
let lijnRechts = false
let lijnLinks = false
let strip: neopixel.Strip = null
let buttonsActive = false
let remoteControl = false
let rijden = false
rijden = false
remoteControl = false
buttonsActive = true
CatCar.resetLedsEnMotor()
led.enable(false)
music.setTempo(300)
strip = neopixel.create(DigitalPin.P16, 5, NeoPixelMode.RGBW)
strip.clear()
strip.show()
basic.forever(function () {
    while (rijden) {
        lijnLinks = CatCar.Line_Sensor(CatCar.lijnSensor.links, CatCar.lijnKleur.zwart)
        lijnRechts = CatCar.Line_Sensor(CatCar.lijnSensor.rechts, CatCar.lijnKleur.zwart)
        // draai links
        // draai rechts
        // check kleursensor
        if (lijnLinks && !(lijnRechts)) {
            CatCar.draaien(CatCar.Turn.links, 15)
            CatCar.maakAchterlampen(100, 0, 0)
        } else if (!(lijnLinks) && lijnRechts) {
            CatCar.draaien(CatCar.Turn.rechts, 15)
            CatCar.maakAchterlampen(0, 0, 100)
        } else if (lijnLinks && lijnRechts) {
            CatCar.rijden(CatCar.Directions.voorwaards, 15)
            if (CatCar.checkColour(NeoPixelColors.Red)) {
                CatCar.stoppenrijden()
                strip.showColor(neopixel.colors(NeoPixelColors.Red))
                basic.pause(100)
                strip.clear()
                strip.show()
            } else if (CatCar.checkColour(NeoPixelColors.Green)) {
                CatCar.stoppenrijden()
                strip.showColor(neopixel.colors(NeoPixelColors.Green))
                basic.pause(100)
                strip.clear()
                strip.show()
            } else if (CatCar.checkColour(NeoPixelColors.Blue)) {
                CatCar.stoppenrijden()
                strip.showColor(neopixel.colors(NeoPixelColors.Blue))
                basic.pause(100)
                strip.clear()
                strip.show()
            } else {
                if (control.millis() % 1000 < 500) {
                    CatCar.maakAchterlampen(100, 0, 100)
                } else {
                    CatCar.maakAchterlampen(0, 0, 0)
                }
            }
        } else {
            CatCar.rijden(CatCar.Directions.voorwaards, 30)
            CatCar.maakAchterlampen(0, 0, 0)
        }
        // check sonar
        sonar = CatCar.sonar()
        // collision. the car will stop and its alarmlichts will blinks
        if (sonar < 7) {
            CatCar.stoppenrijden()
            CatCar.maakAchterlampen(0, 100, 0)
            while (rijden) {
                CatCar.maakAchterlampen(100, 0, 100)
                CatCar.maakKoplampen(100, 50, 50)
                basic.pause(200)
                CatCar.maakAchterlampen(0, 0, 0)
                CatCar.maakKoplampen(0, 0, 0)
                basic.pause(200)
            }
        } else if (sonar < 10) {
            cattower()
        }
        basic.pause(10)
    }
    if (!(remoteControl) && buttonsActive) {
        // if the car is not doing anything do some idle animations
        idleAnimation = randint(0, 30)
        if (idleAnimation == 0) {
            for (let index = 0; index < 2; index++) {
                CatCar.maakKoplampen(100, 100, 100)
                basic.pause(200)
                CatCar.maakKoplampen(0, 0, 0)
                basic.pause(200)
            }
        } else if (idleAnimation == 1) {
            strip.setPixelWhiteLED(0, 255)
            strip.show()
            for (let index = 0; index < 4; index++) {
                strip.rotate(1)
                strip.show()
                basic.pause(200)
            }
            for (let index = 0; index < 4; index++) {
                strip.rotate(-1)
                strip.show()
                basic.pause(200)
            }
            strip.clear()
            strip.show()
        } else if (idleAnimation == 2) {
            CatCar.maakMiddenLeds(100, 100, 100)
            basic.pause(100)
            for (let index = 0; index < 5; index++) {
                CatCar.maakMiddenLeds(100, 100, 0)
                basic.pause(100)
                CatCar.maakMiddenLeds(100, 0, 100)
                basic.pause(100)
                CatCar.maakMiddenLeds(0, 100, 100)
                basic.pause(100)
            }
            CatCar.maakMiddenLeds(0, 0, 0)
        } else if (idleAnimation == 3) {
            if (Math.randomBoolean()) {
                for (let index = 0; index < 3; index++) {
                    knipperlicht(true, false, 300)
                    basic.pause(300)
                }
                basic.pause(500)
                for (let index = 0; index < 3; index++) {
                    knipperlicht(false, true, 300)
                    basic.pause(300)
                }
            } else {
                for (let index = 0; index < 3; index++) {
                    knipperlicht(false, true, 300)
                    basic.pause(300)
                }
                basic.pause(500)
                for (let index = 0; index < 3; index++) {
                    knipperlicht(true, false, 300)
                    basic.pause(300)
                }
            }
        }
    }
    basic.pause(1000)
})
