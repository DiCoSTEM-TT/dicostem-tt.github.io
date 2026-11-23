'use strict';

const TEST_LOCALES = {
  es: {
    question: 'Pregunta {n}',
    progress: '{n} de 9 preguntas respondidas',
    score: '{n} de 9 respuestas correctas',
    understood: 'Tus respuestas se ajustan al patrón de comprensión del test original.',
    unclassified: 'Tus respuestas no se ajustan a uno de los patrones definidos por el test original.',
    pattern: 'Tus respuestas se ajustan al patrón {pattern} del test original.',
    and: ' y ',
    chosen: 'Tu respuesta',
    correct: 'Correcta.',
    answer: 'Respuesta correcta',
    initial: 'Situación inicial de la pregunta {n}',
    spotlightOn: 'Foco encendido',
    spotlightOff: 'Foco apagado',
    questionAlt: 'Manzana {apple}, foco blanco encendido y bombilla {bulb}. El ojo ve la manzana {apple}.',
    solutionAlt: 'Solución: {appearance}',
    invisible: 'la manzana deja de verse',
    visible: 'la manzana se ve {colour}',
    colours: { Blanca: 'Blanca', Azul: 'Azul', Roja: 'Roja', Verde: 'Verde', Celeste: 'Celeste', Magenta: 'Magenta', Amarilla: 'Amarilla', 'No se ve': 'No se ve' },
    appleColours: { azul: 'azul', roja: 'roja', verde: 'verde' }
  },
  pt: {
    question: 'Pergunta {n}',
    progress: '{n} de 9 perguntas respondidas',
    score: '{n} de 9 respostas corretas',
    understood: 'As tuas respostas correspondem ao padrão de compreensão do teste original.',
    unclassified: 'As tuas respostas não correspondem a nenhum dos padrões definidos pelo teste original.',
    pattern: 'As tuas respostas correspondem ao padrão {pattern} do teste original.',
    and: ' e ',
    chosen: 'A tua resposta',
    correct: 'Correta.',
    answer: 'Resposta correta',
    initial: 'Situação inicial da pergunta {n}',
    spotlightOn: 'Foco aceso',
    spotlightOff: 'Foco apagado',
    questionAlt: 'Maçã {apple}, foco branco aceso e lâmpada de luz {bulb}. O olho vê a maçã {apple}.',
    solutionAlt: 'Solução: {appearance}',
    invisible: 'a maçã deixa de ser visível',
    visible: 'a maçã parece {colour}',
    colours: { Blanca: 'Branca', Azul: 'Azul', Roja: 'Vermelha', Verde: 'Verde', Celeste: 'Azul-celeste', Magenta: 'Magenta', Amarilla: 'Amarela', 'No se ve': 'Não se vê' },
    appleColours: { azul: 'azul', roja: 'vermelha', verde: 'verde' },
    bulbColours: { azul: 'azul', roja: 'vermelha', verde: 'verde' }
  },
  en: {
    question: 'Question {n}',
    progress: '{n} of 9 questions answered',
    score: '{n} of 9 answers correct',
    understood: 'Your answers match the understanding pattern of the original test.',
    unclassified: 'Your answers do not match any of the patterns defined by the original test.',
    pattern: 'Your answers match pattern {pattern} of the original test.',
    and: ' and ',
    chosen: 'Your answer',
    correct: 'Correct.',
    answer: 'Correct answer',
    initial: 'Initial situation for question {n}',
    spotlightOn: 'Spotlight on',
    spotlightOff: 'Spotlight off',
    questionAlt: '{apple} apple, white spotlight on and {bulb} bulb. The eye sees the apple as {apple}.',
    solutionAlt: 'Answer: {appearance}',
    invisible: 'the apple is no longer visible',
    visible: 'the apple appears {colour}',
    colours: { Blanca: 'White', Azul: 'Blue', Roja: 'Red', Verde: 'Green', Celeste: 'Sky blue', Magenta: 'Magenta', Amarilla: 'Yellow', 'No se ve': 'Not visible' },
    appleColours: { azul: 'blue', roja: 'red', verde: 'green' }
  }
};

const TEST_FEEDBACK = {
  pt: {
    '-1': 'Os resultados não correspondem a nenhum dos padrões identificados entre mais de 20 000 participantes (desde o ensino básico até docentes universitários). Suspeitamos que não seguiste um único critério ao escolher as respostas. Verificámos que alguns participantes começam por responder segundo um determinado critério, mas a sua insegurança leva-os a mudar de critério a meio das respostas.\nConsulta a solução correta e o mapa conceptual proposto para te ajudar a adotar um critério mais claro.',
    '0': 'Os resultados mostram que és especialista na visão das cores (ou que já tinhas realizado este teste). Fazes parte dos 15,7 % de pessoas que respondem corretamente.\nConsulta a solução correta e o mapa conceptual proposto para consolidar a tua interpretação deste fenómeno.',
    '1': 'Os resultados revelam uma conceção prévia (PRE1). As respostas baseiam-se na ideia de que a cor vista pelo olho é a soma da cor que a maçã reflete da lâmpada com a cor que a maçã emite por ser dessa cor. Esta forma de raciocinar não é correta, mas é muito frequente (50,1 % dos mais de 20 000 participantes, desde o ensino básico até docentes universitários), por ser muito intuitiva.\nConsulta a solução correta e o mapa conceptual proposto para te ajudar a corrigir esta conceção.',
    '2': 'Os resultados revelam uma conceção prévia (PRE2). As respostas baseiam-se na ideia de que a cor vista pelo olho é a cor da maçã: a maçã é dessa cor e será sempre vista dessa cor, independentemente da cor da luz que a ilumina. Esta forma de raciocinar não é correta, mas é muito frequente (18,7 % dos mais de 20 000 participantes, desde o ensino básico até docentes universitários), por ser muito intuitiva.\nConsulta a solução correta e o mapa conceptual proposto para te ajudar a corrigir esta conceção.',
    '3': 'Os resultados revelam uma conceção prévia (PRE3). As respostas baseiam-se na ideia de que a cor vista pelo olho é a cor proveniente da lâmpada. Se essa for a única fonte de luz, essa deverá ser a cor percebida, independentemente das características da maçã. Esta forma de raciocinar não é correta, mas é relativamente frequente (6,6 % dos mais de 20 000 participantes, desde o ensino básico até docentes universitários), por ser bastante intuitiva.\nConsulta a solução correta e o mapa conceptual proposto para te ajudar a corrigir esta conceção.',
    '4': 'Os resultados revelam uma conceção prévia (PRE4). As respostas baseiam-se na ideia de que a lâmpada enche o espaço de luz de uma determinada cor e de que, se a maçã tiver a mesma cor, deixará de ser vista por falta de contraste. Esta forma de raciocinar não é correta, mas é utilizada por 2,8 % dos mais de 20 000 participantes (desde o ensino básico até docentes universitários).\nConsulta a solução correta e o mapa conceptual proposto para te ajudar a corrigir esta conceção.',
    '41': 'Os resultados revelam duas conceções prévias (PRE1 e PRE4).\nAs respostas baseiam-se na ideia de que a cor vista pelo olho é a soma da cor que a maçã reflete da lâmpada com a cor que a maçã emite por ser dessa cor (PRE1).\nAlém disso, considera-se que a lâmpada enche o espaço de luz de uma determinada cor e que, se a maçã tiver a mesma cor, deixará de ser vista por falta de contraste (PRE4).\nConsulta a solução correta e o mapa conceptual proposto para te ajudar a corrigir estas conceções.',
    '42': 'Os resultados revelam duas conceções prévias (PRE2 e PRE4).\nAs respostas baseiam-se na ideia de que a cor vista pelo olho é a cor da maçã: a maçã é dessa cor e será sempre vista dessa cor, independentemente da cor da luz que a ilumina (PRE2).\nAlém disso, considera-se que a lâmpada enche o espaço de luz de uma determinada cor e que, se a maçã tiver a mesma cor, deixará de ser vista por falta de contraste (PRE4).\nConsulta a solução correta e o mapa conceptual proposto para te ajudar a corrigir estas conceções.',
    '43': 'Os resultados revelam duas conceções prévias (PRE3 e PRE4).\nAs respostas baseiam-se na ideia de que a cor vista pelo olho é a cor proveniente da lâmpada. Se essa for a única fonte de luz, essa deverá ser a cor percebida, independentemente das características da maçã (PRE3).\nAlém disso, considera-se que a lâmpada enche o espaço de luz de uma determinada cor e que, se a maçã tiver a mesma cor, deixará de ser vista por falta de contraste (PRE4).\nConsulta a solução correta e o mapa conceptual proposto para te ajudar a corrigir estas conceções.'
  },
  en: {
    '-1': 'The results do not match any of the patterns identified among more than 20,000 respondents (from primary pupils to university lecturers). We suspect that you did not follow a single criterion when selecting your answers. We have observed that some respondents start with one criterion, but their uncertainty leads them to change it halfway through their answers.\nReview the correct answers and proposed concept map to help you adopt a clearer criterion.',
    '0': 'The results indicate that you are an expert in colour vision (or have taken this test before). You belong to the 15.7% of people who answer correctly.\nReview the correct answers and proposed concept map to further consolidate your interpretation of this phenomenon.',
    '1': 'The results reveal a preconception (PRE1). The answers assume that the colour seen by the eye is the sum of the bulb’s colour reflected by the apple and the colour the apple emits because it is that colour. This reasoning is incorrect but widespread (50.1% of more than 20,000 respondents, from primary pupils to university lecturers), because it is highly intuitive.\nReview the correct answers and proposed concept map to help address this preconception.',
    '2': 'The results reveal a preconception (PRE2). The answers assume that the colour seen by the eye is the apple’s colour: the apple is that colour and will always appear that colour, regardless of the colour of the light illuminating it. This reasoning is incorrect but widespread (18.7% of more than 20,000 respondents, from primary pupils to university lecturers), because it is highly intuitive.\nReview the correct answers and proposed concept map to help address this preconception.',
    '3': 'The results reveal a preconception (PRE3). The answers assume that the colour seen by the eye is the colour coming from the bulb. If this is the only light source, it must be the perceived colour, regardless of the apple’s characteristics. This reasoning is incorrect but fairly widespread (6.6% of more than 20,000 respondents, from primary pupils to university lecturers), because it is quite intuitive.\nReview the correct answers and proposed concept map to help address this preconception.',
    '4': 'The results reveal a preconception (PRE4). The answers assume that the bulb fills the space with light of a particular colour and that, if the apple is the same colour, it will not be visible because there is no contrast. This reasoning is incorrect but is used by 2.8% of more than 20,000 respondents (from primary pupils to university lecturers).\nReview the correct answers and proposed concept map to help address this preconception.',
    '41': 'The results reveal two preconceptions (PRE1 and PRE4).\nThe answers assume that the colour seen by the eye is the sum of the bulb’s colour reflected by the apple and the colour the apple emits because it is that colour (PRE1).\nThey also assume that the bulb fills the space with light of a particular colour and that, if the apple is the same colour, it will not be visible because there is no contrast (PRE4).\nReview the correct answers and proposed concept map to help address these preconceptions.',
    '42': 'The results reveal two preconceptions (PRE2 and PRE4).\nThe answers assume that the colour seen by the eye is the apple’s colour: the apple is that colour and will always appear that colour, regardless of the colour of the light illuminating it (PRE2).\nThey also assume that the bulb fills the space with light of a particular colour and that, if the apple is the same colour, it will not be visible because there is no contrast (PRE4).\nReview the correct answers and proposed concept map to help address these preconceptions.',
    '43': 'The results reveal two preconceptions (PRE3 and PRE4).\nThe answers assume that the colour seen by the eye is the colour coming from the bulb. If this is the only light source, it must be the perceived colour, regardless of the apple’s characteristics (PRE3).\nThey also assume that the bulb fills the space with light of a particular colour and that, if the apple is the same colour, it will not be visible because there is no contrast (PRE4).\nReview the correct answers and proposed concept map to help address these preconceptions.'
  }
};

TEST_LOCALES.es.sceneLabels = { spotlight: "Foco de luz blanca", bulb: "Bombilla", eye: "Ojo" };

TEST_LOCALES.pt.sceneLabels = { spotlight: "Foco de luz branca", bulb: "Lâmpada", eye: "Olho" };

TEST_LOCALES.en.sceneLabels = { spotlight: "White spotlight", bulb: "Bulb", eye: "Eye" };

TEST_LOCALES.es.prismTitle = "Descomposición de la luz blanca en rojo, verde y azul";
TEST_LOCALES.pt.prismTitle = "Decomposição da luz branca em vermelho, verde e azul";
TEST_LOCALES.en.prismTitle = "White light separated into red, green and blue";
TEST_LOCALES.es.additiveTitle = "Mezcla aditiva de luces roja, verde y azul";
TEST_LOCALES.pt.additiveTitle = "Mistura aditiva de luz vermelha, verde e azul";
TEST_LOCALES.en.additiveTitle = "Additive mixing of red, green and blue light";
